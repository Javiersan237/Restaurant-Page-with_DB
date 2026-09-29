# 📋 Tabla: Agendas

## Descripción

Almacena los **bloques de tiempo reservables** del restaurante. Cada agenda
representa un intervalo específico (fecha + hora inicio + hora fin) que
puede contener una o varias reservaciones.

Las agendas se crean **automáticamente** al hacer la primera reserva de un
bloque y se eliminan **lazy** cuando ya vencieron y no tienen reservaciones.

## Estructura

| Columna | Tipo | Nulo | Default | Descripción |
|---------|------|:----:|---------|-------------|
| `AgendaID` | `INT IDENTITY(1,1)` | ❌ | auto | Identificador único |
| `Fecha` | `DATE` | ❌ | — | Fecha del bloque |
| `HoraInicio` | `TIME(0)` | ❌ | — | Hora de inicio |
| `HoraFin` | `TIME(0)` | ❌ | — | Hora de fin |
| `DuracionMin` | `INT` | ❌ | — | Duración en minutos (30–180) |
| `Estado` | `NVARCHAR(20)` | ❌ | `'Abierta'` | Estado del bloque |
| `FechaCreacion` | `DATETIME` | ❌ | `GETDATE()` | Timestamp de creación |

## Valores permitidos

**Estado**:

- `Abierta` — Disponible para reservaciones
- `Cerrada` — No disponible

## Restricciones

| Nombre | Tipo | Columnas | Definición |
|--------|------|----------|------------|
| `PK_Agendas` | Primary Key | `AgendaID` | Identificador único |
| `UQ_Agendas_Fecha_Horas` | Unique | `(Fecha, HoraInicio, HoraFin)` | No puede haber dos agendas idénticas |
| `CK_Agendas_Horas` | Check | `HoraInicio`, `HoraFin` | `HoraFin > HoraInicio` |
| `CK_Agendas_Duracion` | Check | `DuracionMin` | Entre 30 y 180 minutos |
| `CK_Agendas_Estado` | Check | `Estado` | Solo valores permitidos |

## Script de creación

```sql
CREATE TABLE dbo.Agendas (
    AgendaID       INT IDENTITY(1,1) NOT NULL,
    Fecha          DATE              NOT NULL,
    HoraInicio     TIME(0)           NOT NULL,
    HoraFin        TIME(0)           NOT NULL,
    DuracionMin    INT               NOT NULL,
    Estado         NVARCHAR(20)      NOT NULL 
                   CONSTRAINT DF_Agendas_Estado DEFAULT ('Abierta'),
    FechaCreacion  DATETIME          NOT NULL 
                   CONSTRAINT DF_Agendas_FechaCreacion DEFAULT (GETDATE()),

    CONSTRAINT PK_Agendas PRIMARY KEY CLUSTERED (AgendaID),
    CONSTRAINT UQ_Agendas_Fecha_Horas UNIQUE (Fecha, HoraInicio, HoraFin),
    CONSTRAINT CK_Agendas_Horas CHECK (HoraFin > HoraInicio),
    CONSTRAINT CK_Agendas_Duracion CHECK (DuracionMin BETWEEN 30 AND 180),
    CONSTRAINT CK_Agendas_Estado CHECK (Estado IN ('Abierta','Cerrada'))
);
GO
```

## Consultas frecuentes

**Buscar agenda existente por bloque:**

```sql
SELECT AgendaID FROM dbo.Agendas
WHERE Fecha = @Fecha
  AND HoraInicio = @HoraInicio
  AND HoraFin = @HoraFin;
```

**Limpiar agendas vencidas sin reservaciones (lazy):**

```sql
DELETE FROM dbo.Agendas
WHERE AgendaID NOT IN (SELECT DISTINCT AgendaID FROM dbo.Reservaciones)
  AND (
      Fecha < CAST(GETDATE() AS DATE)
      OR (Fecha = CAST(GETDATE() AS DATE) AND HoraFin < CAST(GETDATE() AS TIME))
  );
```

**Agendas activas de hoy:**

```sql
SELECT AgendaID, HoraInicio, HoraFin, DuracionMin, Estado
FROM dbo.Agendas
WHERE Fecha = CAST(GETDATE() AS DATE)
  AND Estado = 'Abierta'
ORDER BY HoraInicio;
```

## Notas de diseño

- **Creación automática**: no hay panel de admin para crear agendas. El backend
  las crea al vuelo cuando un cliente reserva.
- **Deduplicación**: la `UQ_Agendas_Fecha_Horas` evita agendas duplicadas con
  el mismo bloque.
- **Sin campo `CapacidadMax`**: la capacidad es **global** del restaurante (50
  personas), no por agenda. Se valida sumando `NumeroPersonas` de las reservas
  activas en ese bloque.
- **Sin campo `MesaID`**: una agenda puede contener reservas de **varias
  mesas** (ej: misma agenda "19:00-21:00" con reservas en S2, T3 y P1).