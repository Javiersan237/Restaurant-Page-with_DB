# 📋 Tabla: Mesas

## Descripción

Catálogo de las mesas físicas del restaurante. Cada mesa tiene una
capacidad máxima, una ubicación dentro del establecimiento y un estado
operativo. **No** almacena información de reservaciones; solo representa
el inventario físico del mobiliario.

## Estructura

| Columna | Tipo | Nulo | Default | Descripción |
|---------|------|:----:|---------|-------------|
| `MesaID` | `INT IDENTITY(1,1)` | ❌ | auto | Identificador único de la mesa |
| `NumeroMesa` | `NVARCHAR(10)` | ❌ | — | Código visible de la mesa (ej: `T1`, `B3`) |
| `Capacidad` | `INT` | ❌ | — | Número máximo de comensales |
| `Ubicacion` | `NVARCHAR(50)` | ❌ | — | Zona del restaurante |
| `Estado` | `NVARCHAR(20)` | ❌ | `'Disponible'` | Estado operativo actual |

## Valores permitidos

**Ubicacion** (sugeridos, no restringidos por CHECK):

- `Terraza`
- `Salón Principal`
- `Salón Privado`
- `Bar`

**Estado** (restringidos por CHECK):

- `Disponible` — Lista para recibir reservaciones
- `Ocupada` — Cliente sentado actualmente
- `Reservada` — Bloqueada por reservación activa
- `Mantenimiento` — Fuera de servicio temporalmente

## Restricciones

| Nombre | Tipo | Columnas | Definición |
|--------|------|----------|------------|
| `PK_Mesas` | Primary Key | `MesaID` | Identificador único |
| `UQ_Mesas_NumeroMesa` | Unique | `NumeroMesa` | No puede haber dos mesas con el mismo código |
| `CK_Mesas_Capacidad` | Check | `Capacidad` | Debe estar entre 1 y 20 |
| `CK_Mesas_Estado` | Check | `Estado` | Solo valores permitidos |

## Script de creación

```sql
CREATE TABLE Mesas (
    MesaID          INT IDENTITY(1,1)   NOT NULL,
    NumeroMesa      NVARCHAR(10)        NOT NULL,
    Capacidad       INT                 NOT NULL,
    Ubicacion       NVARCHAR(50)        NOT NULL,
    Estado          NVARCHAR(20)        NOT NULL DEFAULT 'Disponible',

    CONSTRAINT PK_Mesas PRIMARY KEY (MesaID),
    CONSTRAINT UQ_Mesas_NumeroMesa UNIQUE (NumeroMesa),
    CONSTRAINT CK_Mesas_Capacidad CHECK (Capacidad BETWEEN 1 AND 20),
    CONSTRAINT CK_Mesas_Estado CHECK (
        Estado IN ('Disponible','Ocupada','Reservada','Mantenimiento')
    )
);
GO
```

## Datos iniciales

| MesaID | NumeroMesa | Capacidad | Ubicacion | Estado |
|:------:|:----------:|:---------:|-----------|--------|
| 1 | T1 | 2 | Terraza | Disponible |
| 2 | T2 | 2 | Terraza | Disponible |
| 3 | T3 | 4 | Terraza | Disponible |
| 4 | S1 | 2 | Salón Principal | Disponible |
| 5 | S2 | 4 | Salón Principal | Disponible |
| 6 | S3 | 4 | Salón Principal | Disponible |
| 7 | S4 | 6 | Salón Principal | Disponible |
| 8 | P1 | 8 | Salón Privado | Disponible |
| 9 | P2 | 10 | Salón Privado | Disponible |
| 10 | B1 | 2 | Bar | Disponible |
| 11 | B2 | 2 | Bar | Disponible |
| 12 | B3 | 3 | Bar | Disponible |

## Consultas frecuentes

**Mesas disponibles para N personas en fecha/hora específica:**

```sql
SELECT m.MesaID, m.NumeroMesa, m.Capacidad, m.Ubicacion
FROM Mesas m
WHERE m.Capacidad >= @NumeroPersonas
  AND m.Estado = 'Disponible'
  AND m.MesaID NOT IN (
      SELECT r.MesaID
      FROM Reservaciones r
      WHERE r.Fecha = @Fecha
        AND r.Hora BETWEEN DATEADD(HOUR, -1, @Hora) AND DATEADD(HOUR, 1, @Hora)
        AND r.Estado IN ('Pendiente','Confirmada')
  )
ORDER BY m.Capacidad ASC, m.Ubicacion;
```

**Conteo de mesas por ubicación:**

```sql
SELECT Ubicacion, COUNT(*) AS TotalMesas, SUM(Capacidad) AS CapacidadTotal
FROM Mesas
GROUP BY Ubicacion
ORDER BY Ubicacion;
```

**Mesas en mantenimiento:**

```sql
SELECT MesaID, NumeroMesa, Ubicacion
FROM Mesas
WHERE Estado = 'Mantenimiento';
```

## Notas de diseño

- El campo `Ubicacion` es texto libre en lugar de tabla catálogo porque
  las zonas de un restaurante raramente cambian y no necesitan metadatos.
- `Estado` en Mesas describe el estado **físico actual**, no el estado de
  reservación. Una mesa "Reservada" está bloqueada hasta que llegue el
  cliente, pero no implica que ya esté ocupada.
- `NumeroMesa` es el identificador visible al personal (camareros, hostess);
  `MesaID` es interno y nunca se muestra al usuario.
- Si el restaurante crece y necesita reservar mesas combinadas (ej: dos
  mesas juntas para 8 personas), este diseño lo soporta agregando una
  columna `MesaCombinadaID` o creando una tabla `MesasCombinadas`.