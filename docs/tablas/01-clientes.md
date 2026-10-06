# 📋 Tabla: Clientes

## Descripción

Almacena la información de los clientes del restaurante **ÉLYSÉE**. Cada
cliente puede realizar múltiples reservaciones a lo largo del tiempo. La
tabla distingue entre clientes regulares y clientes VIP.

Además, esta tabla maneja la **autenticación de clientes** con contraseñas
hasheadas con bcrypt.

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
| `PasswordHash` | `NVARCHAR(255)` | ✅ | `NULL` | Hash bcrypt de la contraseña |
| `Activo` | `BIT` | ❌ | `1` | Cuenta activa (1) o desactivada (0) |
| `UltimoLogin` | `DATETIME` | ✅ | `NULL` | Último inicio de sesión |
| `FechaRegistro` | `DATETIME` | ❌ | `GETDATE()` | Fecha de alta en el sistema |

## Restricciones

| Nombre | Tipo | Columnas | Definición |
|--------|------|----------|------------|
| `PK_Clientes` | Primary Key | `ClienteID` | Identificador único |
| `UQ_Clientes_Email` | Unique | `Email` | No se permiten emails duplicados |
| `CK_Clientes_Email` | Check | `Email` | Debe cumplir formato `algo@algo.algo` |
| `CK_Clientes_Nombre` | Check | `Nombre` | No vacío |
| `CK_Clientes_Apellido` | Check | `Apellido` | No vacío |
| `DF_Clientes_EsVIP` | Default | `EsVIP` | Default `0` |
| `DF_Clientes_Activo` | Default | `Activo` | Default `1` |
| `DF_Clientes_FechaRegistro` | Default | `FechaRegistro` | Default `GETDATE()` |

## Script de creación

```sql
CREATE TABLE dbo.Clientes (
    ClienteID       INT IDENTITY(1,1)   NOT NULL,
    Nombre          NVARCHAR(100)       NOT NULL,
    Apellido        NVARCHAR(100)       NOT NULL,
    Email           NVARCHAR(150)       NOT NULL,
    Telefono        NVARCHAR(20)        NULL,
    Preferencias    NVARCHAR(500)       NULL,
    EsVIP           BIT                 NOT NULL CONSTRAINT DF_Clientes_EsVIP DEFAULT (0),
    PasswordHash    NVARCHAR(255)       NULL,
    Activo          BIT                 NOT NULL CONSTRAINT DF_Clientes_Activo DEFAULT (1),
    UltimoLogin     DATETIME            NULL,
    FechaRegistro   DATETIME            NOT NULL CONSTRAINT DF_Clientes_FechaRegistro DEFAULT (GETDATE()),

    CONSTRAINT PK_Clientes PRIMARY KEY CLUSTERED (ClienteID),
    CONSTRAINT UQ_Clientes_Email UNIQUE (Email),
    CONSTRAINT CK_Clientes_Email CHECK (Email LIKE '%_@_%._%'),
    CONSTRAINT CK_Clientes_Nombre CHECK (LEN(LTRIM(RTRIM(Nombre))) > 0),
    CONSTRAINT CK_Clientes_Apellido CHECK (LEN(LTRIM(RTRIM(Apellido))) > 0)
);
GO
```

## Ejemplo de datos

| ClienteID | Nombre | Apellido | Email | EsVIP | Activo |
|:---------:|--------|----------|-------|:-----:|:------:|
| 1 | Sofía | Márquez | sofia@example.com | 0 | 1 |
| 2 | Alejandro | Rivas | alex.rivas@example.com | 1 | 1 |
| 3 | Camila | Ortega | camila.o@example.com | 0 | 1 |

**Nota**: el `PasswordHash` NO se muestra por seguridad.

## Consultas frecuentes

**Buscar cliente por email** (para login):

```sql
SELECT 
    ClienteID, Nombre, Apellido, Email, Telefono,
    PasswordHash, EsVIP, Activo
FROM dbo.Clientes
WHERE Email = @Email;
```

**Listar clientes VIP:**

```sql
SELECT ClienteID, Nombre + ' ' + Apellido AS NombreCompleto, Email, Telefono
FROM dbo.Clientes
WHERE EsVIP = 1 AND Activo = 1
ORDER BY Apellido, Nombre;
```

**Historial de reservaciones de un cliente:**

```sql
SELECT 
    r.ReservacionID,
    a.Fecha,
    a.HoraInicio,
    a.HoraFin,
    r.NumeroPersonas,
    r.Estado,
    m.NumeroMesa,
    m.Ubicacion
FROM dbo.Reservaciones r
INNER JOIN dbo.Mesas m ON m.MesaID = r.MesaID
INNER JOIN dbo.Agendas a ON a.AgendaID = r.AgendaID
WHERE r.ClienteID = @ClienteID
ORDER BY a.Fecha DESC, a.HoraInicio DESC;
```

## Notas de diseño

- El campo `Preferencias` es texto libre para flexibilidad inicial. En el
  futuro podría normalizarse en una tabla `PreferenciasCliente`.
- El email se valida con un `CHECK` básico. Validaciones más estrictas se
  hacen en el backend (formato RFC 5322, etc.).
- `EsVIP` es un flag simple. Si los niveles VIP se vuelven complejos
  (Oro, Plata, Bronce) se migrará a una tabla catálogo.
- **`PasswordHash`** almacena el hash bcrypt de la contraseña (10 rounds).
  **NUNCA** se devuelve en respuestas de API.
- **`Activo`** permite deshabilitar cuentas sin borrarlas físicamente.
- **`UltimoLogin`** se actualiza automáticamente cuando el cliente inicia sesión.