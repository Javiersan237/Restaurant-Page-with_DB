# 📋 Tabla: Reservaciones

## Descripción

Tabla central del sistema. Representa cada reservación hecha por un
cliente para una mesa específica en una fecha y hora determinadas. Es la
tabla puente que conecta **Clientes** con **Mesas** y contiene toda la
información operativa de cada evento.

## Estructura

| Columna | Tipo | Nulo | Default | Descripción |
|---------|------|:----:|---------|-------------|
| `ReservacionID` | `INT IDENTITY(1,1)` | ❌ | auto | Identificador único |
| `ClienteID` | `INT` | ❌ | — | FK → Clientes.ClienteID |
| `MesaID` | `INT` | ❌ | — | FK → Mesas.MesaID |
| `Fecha` | `DATE` | ❌ | — | Fecha de la reservación |
| `Hora` | `TIME(0)` | ❌ | — | Hora de llegada |
| `NumeroPersonas` | `INT` | ❌ | — | Número de comensales |
| `Estado` | `NVARCHAR(20)` | ❌ | `'Pendiente'` | Estado del ciclo de vida |
| `Notas` | `NVARCHAR(300)` | ✅ | `NULL` | Peticiones especiales del cliente |
| `FechaCreacion` | `DATETIME` | ❌ | `GETDATE()` | Timestamp de creación |

## Valores permitidos

**Estado** (restringidos por CHECK):

| Estado | Descripción | Transiciones permitidas |
|--------|-------------|-------------------------|
| `Pendiente` | Creada pero no confirmada | → `Confirmada`, `Cancelada` |
| `Confirmada` | Confirmada por el restaurante | → `Completada`, `Cancelada`, `NoShow` |
| `Cancelada` | Cancelada por cliente o restaurante | (terminal) |
| `Completada` | Cliente asistió y consumió | (terminal) |
| `NoShow` | Cliente no asistió | (terminal) |

## Restricciones

| Nombre | Tipo | Columnas | Definición |
|--------|------|----------|------------|
| `PK_Reservaciones` | Primary Key | `ReservacionID` | Identificador único |
| `FK_Reservaciones_Clientes` | Foreign Key | `ClienteID` | → `Clientes(ClienteID)` · `ON DELETE CASCADE` |
| `FK_Reservaciones_Mesas` | Foreign Key | `MesaID` | → `Mesas(MesaID)` · `ON DELETE NO ACTION` |
| `CK_Reservaciones_Estado` | Check | `Estado` | Solo valores permitidos |
| `CK_Reservaciones_Personas` | Check | `NumeroPersonas` | Entre 1 y 20 |
| `CK_Reservaciones_Fecha` | Check | `Fecha` | Debe ser hoy o futuro |

## Índices

| Nombre | Columnas | Propósito |
|--------|----------|-----------|
| `IX_Reservaciones_Fecha_Hora` | `(Fecha, Hora)` | Consultas de disponibilidad |
| `IX_Reservaciones_Mesa_Fecha` | `(MesaID, Fecha)` | Detectar doble reservación |
| `IX_Reservaciones_Cliente` | `(ClienteID)` | Historial de un cliente |
| `IX_Reservaciones_Estado` | `(Estado)` | Filtros por estado |

## Script de creación

```sql
CREATE TABLE Reservaciones (
    ReservacionID   INT IDENTITY(1,1)   NOT NULL,
    ClienteID       INT                 NOT NULL,
    MesaID          INT                 NOT NULL,
    Fecha           DATE                NOT NULL,
    Hora            TIME(0)             NOT NULL,
    NumeroPersonas  INT                 NOT NULL,
    Estado          NVARCHAR(20)        NOT NULL DEFAULT 'Pendiente',
    Notas           NVARCHAR(300)       NULL,
    FechaCreacion   DATETIME            NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Reservaciones PRIMARY KEY (ReservacionID),

    CONSTRAINT FK_Reservaciones_Clientes
        FOREIGN KEY (ClienteID) REFERENCES Clientes(ClienteID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT FK_Reservaciones_Mesas
        FOREIGN KEY (MesaID) REFERENCES Mesas(MesaID)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,

    CONSTRAINT CK_Reservaciones_Estado CHECK (
        Estado IN ('Pendiente','Confirmada','Cancelada','Completada','NoShow')
    ),
    CONSTRAINT CK_Reservaciones_Personas CHECK (NumeroPersonas BETWEEN 1 AND 20),
    CONSTRAINT CK_Reservaciones_Fecha CHECK (Fecha >= CAST(GETDATE() AS DATE))
);
GO

CREATE INDEX IX_Reservaciones_Fecha_Hora
    ON Reservaciones(Fecha, Hora);
CREATE INDEX IX_Reservaciones_Mesa_Fecha
    ON Reservaciones(MesaID, Fecha);
CREATE INDEX IX_Reservaciones_Cliente
    ON Reservaciones(ClienteID);
CREATE INDEX IX_Reservaciones_Estado
    ON Reservaciones(Estado);
GO
```

## Ejemplo de datos

| ReservacionID | ClienteID | MesaID | Fecha | Hora | NumeroPersonas | Estado | Notas |
|:-------------:|:---------:|:------:|-------|------|:--------------:|--------|-------|
| 1 | 1 | 5 | 2026-10-15 | 20:00 | 4 | Confirmada | Aniversario, vista jardín |
| 2 | 2 | 9 | 2026-10-20 | 21:00 | 8 | Pendiente | Reunión de negocios |
| 3 | 1 | 3 | 2026-11-01 | 19:30 | 2 | Pendiente | Alergia a mariscos |

## Consultas frecuentes

**Todas las reservaciones de un cliente (JOIN triple):**

```sql
SELECT 
    r.ReservacionID,
    c.Nombre + ' ' + c.Apellido AS Cliente,
    m.NumeroMesa,
    m.Ubicacion,
    r.Fecha,
    r.Hora,
    r.NumeroPersonas,
    r.Estado,
    r.Notas
FROM Reservaciones r
INNER JOIN Clientes c ON c.ClienteID = r.ClienteID
INNER JOIN Mesas    m ON m.MesaID    = r.MesaID
WHERE c.Email = @Email
ORDER BY r.Fecha DESC, r.Hora DESC;
```

**Reservaciones del día actual (para el hostess):**

```sql
SELECT 
    r.Hora,
    m.NumeroMesa,
    m.Ubicacion,
    c.Nombre + ' ' + c.Apellido AS Cliente,
    r.NumeroPersonas,
    r.Estado,
    r.Notas
FROM Reservaciones r
INNER JOIN Clientes c ON c.ClienteID = r.ClienteID
INNER JOIN Mesas    m ON m.MesaID    = r.MesaID
WHERE r.Fecha = CAST(GETDATE() AS DATE)
  AND r.Estado IN ('Pendiente','Confirmada')
ORDER BY r.Hora;
```

**Verificar doble reservación (transacción con bloqueo):**

```sql
BEGIN TRANSACTION;
    IF EXISTS (
        SELECT 1 FROM Reservaciones WITH (UPDLOCK, HOLDLOCK)
        WHERE MesaID = @MesaID
          AND Fecha  = @Fecha
          AND Hora   = @Hora
          AND Estado IN ('Pendiente','Confirmada')
    )
    BEGIN
        ROLLBACK;
        THROW 50001, 'La mesa ya está reservada en ese horario.', 1;
    END

    INSERT INTO Reservaciones (ClienteID, MesaID, Fecha, Hora, NumeroPersonas, Estado, Notas)
    VALUES (@ClienteID, @MesaID, @Fecha, @Hora, @NumeroPersonas, 'Pendiente', @Notas);
COMMIT;
```

## Notas de diseño

- **No hay tabla catálogo de estados**: solo 5 valores estables, así que un
  `CHECK CONSTRAINT` es suficiente y evita JOINs innecesarios.
- **`ON DELETE CASCADE` desde Clientes**: si se borra un cliente, sus
  reservaciones se eliminan. Aceptable porque un cliente borrado no debe
  tener histórico activo.
- **`ON DELETE NO ACTION` desde Mesas**: protege el histórico. Si una mesa
  se da de baja, se marca `Mantenimiento` en lugar de borrarse.
- **Doble reservación**: no se previene a nivel de constraint; se maneja en
  backend con transacción y `UPDLOCK`.
- **Duración estándar**: se asume 2 horas por reservación. La consulta de
  disponibilidad considera ±1h para cubrir solapamientos básicos. Si se
  necesitara precisión total, se agregaría una columna `DuracionMinutos`.
- **`FechaCreacion`** es auditoría mínima. En producción se recomienda
  agregar `FechaModificacion` y `UsuarioModificacion`.