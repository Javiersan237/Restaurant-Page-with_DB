# 📋 Tabla: Clientes

## Descripción

Almacena la información de los clientes del restaurante **ÉLYSÉE**. Cada
cliente puede realizar múltiples reservaciones a lo largo del tiempo. La
tabla distingue entre clientes regulares y clientes VIP (con beneficios
exclusivos como mesas preferentes y atención personalizada).

## Estructura

| Columna | Tipo | Nulo | Default | Descripción |
|---------|------|:----:|---------|-------------|
| `ClienteID` | `INT IDENTITY(1,1)` | ❌ | auto | Identificador único del cliente |
| `Nombre` | `NVARCHAR(100)` | ❌ | — | Nombre(s) del cliente |
| `Apellido` | `NVARCHAR(100)` | ❌ | — | Apellido(s) del cliente |
| `Email` | `NVARCHAR(150)` | ❌ | — | Correo electrónico (único) |
| `Telefono` | `NVARCHAR(20)` | ✅ | `NULL` | Teléfono con código país |
| `Preferencias` | `NVARCHAR(500)` | ✅ | `NULL` | Alergias, preferencias, ocasiones especiales |
| `EsVIP` | `BIT` | ❌ | `0` | Indica si el cliente es VIP (1) o regular (0) |
| `FechaRegistro` | `DATETIME` | ❌ | `GETDATE()` | Fecha de alta en el sistema |

## Restricciones

| Nombre | Tipo | Columnas | Definición |
|--------|------|----------|------------|
| `PK_Clientes` | Primary Key | `ClienteID` | Identificador único |
| `UQ_Clientes_Email` | Unique | `Email` | No se permiten emails duplicados |
| `CK_Clientes_Email` | Check | `Email` | Debe cumplir formato `algo@algo.algo` |

## Script de creación

```sql
CREATE TABLE Clientes (
    ClienteID       INT IDENTITY(1,1)   NOT NULL,
    Nombre          NVARCHAR(100)       NOT NULL,
    Apellido        NVARCHAR(100)       NOT NULL,
    Email           NVARCHAR(150)       NOT NULL,
    Telefono        NVARCHAR(20)        NULL,
    Preferencias    NVARCHAR(500)       NULL,
    EsVIP           BIT                 NOT NULL DEFAULT 0,
    FechaRegistro   DATETIME            NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Clientes PRIMARY KEY (ClienteID),
    CONSTRAINT UQ_Clientes_Email UNIQUE (Email),
    CONSTRAINT CK_Clientes_Email CHECK (Email LIKE '%_@_%._%')
);
GO
```

## Ejemplo de datos

| ClienteID | Nombre | Apellido | Email | Telefono | EsVIP |
|-----------|--------|----------|-------|----------|:-----:|
| 1 | Sofía | Márquez | sofia@example.com | +52 555 123 4567 | 0 |
| 2 | Alejandro | Rivas | alex.rivas@example.com | +52 555 987 6543 | 1 |
| 3 | Camila | Ortega | camila.o@example.com | +52 555 246 8135 | 0 |

## Consultas frecuentes

**Buscar cliente por email** (para saber si ya existe antes de crear reservación):

```sql
SELECT ClienteID, Nombre, Apellido, EsVIP
FROM Clientes
WHERE Email = @Email;
```

**Listar clientes VIP:**

```sql
SELECT ClienteID, Nombre + ' ' + Apellido AS NombreCompleto, Email, Telefono
FROM Clientes
WHERE EsVIP = 1
ORDER BY Apellido, Nombre;
```

**Historial de reservaciones de un cliente:**

```sql
SELECT 
    r.ReservacionID,
    r.Fecha,
    r.Hora,
    r.NumeroPersonas,
    r.Estado,
    m.NumeroMesa,
    m.Ubicacion
FROM Reservaciones r
INNER JOIN Mesas m ON m.MesaID = r.MesaID
WHERE r.ClienteID = @ClienteID
ORDER BY r.Fecha DESC, r.Hora DESC;
```

## Notas de diseño

- El campo `Preferencias` es texto libre para flexibilidad inicial. En el
  futuro podría normalizarse en una tabla `PreferenciasCliente`.
- El email se valida con un `CHECK` básico. Validaciones más estrictas se
  hacen en el backend (formato RFC 5322, etc.).
- `EsVIP` es un flag simple. Si los niveles VIP se vuelven complejos
  (Oro, Plata, Bronce) se migrará a una tabla catálogo.
- No se usa `soft delete` en esta versión. Si se necesita auditoría
  estricta, agregar una columna `Activo BIT DEFAULT 1` en el futuro.