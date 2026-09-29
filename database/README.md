# 🗄️ Base de Datos — ÉLYSÉE Reservas

Scripts SQL, migraciones, seeds, queries y pruebas de la base de datos `ElyseeDB`.

**Motor**: SQL Server 2019+
**Collation**: `SQL_Latin1_General_CP1_CI_AS`
**Nombre de la BD**: `ElyseeDB`

## Estructura

```
database/
├── migrations/   → Scripts secuenciales de creación de la BD
├── seeds/        → Datos de prueba para desarrollo
├── queries/      → Consultas SQL reutilizables
├── tests/        → Pruebas de constraints y queries
└── README.md     → Este archivo
```

## Orden de ejecución de las migraciones

Ejecutar **en orden secuencial**. Cada script depende del anterior.

| # | Script | Propósito |
|---|--------|-----------|
| 0001 | `0001_DropAndCreateDatabase.sql` | Elimina y crea la BD `ElyseeDB` |
| 0002 | `0002_Create_Clientes.sql` | Crea tabla `Clientes` |
| 0003 | `0003_Create_Mesas.sql` | Crea tabla `Mesas` |
| 0004 | `0004_Create_Agendas.sql` | Crea tabla `Agendas` |
| 0005 | `0005_Create_Reservaciones.sql` | Crea tabla `Reservaciones` con 3 FKs |
| 0006 | `0006_Create_Indexes.sql` | Crea índices de rendimiento |
| 0007 | `0007_Insert_DatosIniciales.sql` | Inserta las 13 mesas (50 personas) |

## Cómo ejecutar las migraciones

### Opción A — SQL Server Management Studio (SSMS)

1. Abre SSMS y conéctate a tu instancia de SQL Server.
2. Abre cada archivo `.sql` en orden: `0001`, `0002`, ...
3. Ejecuta con `F5`.
4. Verifica que no haya errores en el panel de mensajes.
5. Pasa al siguiente script.

### Opción B — sqlcmd

```cmd
sqlcmd -S localhost,1433 -U sa -P TuPassword -i database\migrations\0001_DropAndCreateDatabase.sql
sqlcmd -S localhost,1433 -U sa -P TuPassword -i database\migrations\0002_Create_Clientes.sql
sqlcmd -S localhost,1433 -U sa -P TuPassword -i database\migrations\0003_Create_Mesas.sql
sqlcmd -S localhost,1433 -U sa -P TuPassword -i database\migrations\0004_Create_Agendas.sql
sqlcmd -S localhost,1433 -U sa -P TuPassword -i database\migrations\0005_Create_Reservaciones.sql
sqlcmd -S localhost,1433 -U sa -P TuPassword -i database\migrations\0006_Create_Indexes.sql
sqlcmd -S localhost,1433 -U sa -P TuPassword -i database\migrations\0007_Insert_DatosIniciales.sql
```

## Cargar datos de prueba (seeds)

Los seeds insertan datos de prueba para desarrollo. **No se ejecutan en producción.**

### Contenido de los seeds

| Archivo | Contenido |
|---------|-----------|
| `seeds/seed_clientes.sql` | 20 clientes (5 VIP, 15 regulares) |
| `seeds/seed_reservaciones.sql` | 40 reservaciones en distintos estados y fechas |

### Orden de ejecución

1. **Primero**: `seed_clientes.sql` (los clientes deben existir antes de las reservaciones).
2. **Después**: `seed_reservaciones.sql`.

### Cómo ejecutarlos

**Opción A — SSMS:**

1. Abre SSMS y conéctate a `ElyseeDB`.
2. Ejecuta `seeds/seed_clientes.sql` con `F5`.
3. Ejecuta `seeds/seed_reservaciones.sql` con `F5`.

**Opción B — sqlcmd:**

```cmd
sqlcmd -S localhost,1433 -U sa -P TuPassword -d ElyseeDB -i database\seeds\seed_clientes.sql
sqlcmd -S localhost,1433 -U sa -P TuPassword -d ElyseeDB -i database\seeds\seed_reservaciones.sql
```

### Idempotencia

Los seeds son **idempotentes**: si ya hay datos, no insertan de nuevo.
Para volver a cargarlos desde cero:

```sql
USE ElyseeDB;
GO

DELETE FROM dbo.Reservaciones;
DELETE FROM dbo.Agendas;
DELETE FROM dbo.Clientes;
-- Las mesas NO se borran (son datos iniciales)
```

### Verificar que cargaron bien

```sql
USE ElyseeDB;
GO

SELECT COUNT(*) AS Clientes FROM dbo.Clientes;         -- Esperado: 20
SELECT COUNT(*) AS Agendas FROM dbo.Agendas;           -- Esperado: ~30
SELECT COUNT(*) AS Reservaciones FROM dbo.Reservaciones; -- Esperado: ~40

SELECT Estado, COUNT(*) AS Total
FROM dbo.Reservaciones
GROUP BY Estado;
```

## Verificar que la BD se creó correctamente

Después de ejecutar todas las migraciones:

```sql
USE ElyseeDB;
GO
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
```

Debe devolver:
```
TABLE_NAME
--------------
Agendas
Clientes
Mesas
Reservaciones
```

Y verificar las 13 mesas:

```sql
SELECT COUNT(*) AS TotalMesas, SUM(Capacidad) AS CapacidadTotal FROM dbo.Mesas;
-- Esperado: 13 mesas, 50 personas
```

## Ejecutar los tests

Los tests validan que los constraints y queries funcionan correctamente.
**No modifican datos reales** (usan TRANSACTIONS con ROLLBACK).

### Archivos

| Archivo | Propósito |
|---------|-----------|
| `tests/test_constraints.sql` | Valida CHECK, FK, UNIQUE |
| `tests/test_queries.sql` | Valida las queries y la estructura |

### Cómo ejecutarlos

1. Abre SSMS y conéctate a `ElyseeDB` con `sa`.
2. Abre `tests/test_constraints.sql`.
3. Ejecuta con `F5`.
4. Revisa la tabla de resultados al final.
5. Repite con `tests/test_queries.sql`.

### Interpretación de resultados

- **OK**: el test pasó (el constraint o query se comporta como se espera).
- **FALLO**: el test falló (algo cambió y hay que revisar).

Si algún test **falla**, significa que un constraint fue modificado o eliminado.
Revisar la sección "Reglas para agregar nuevas migraciones".

## Reglas para agregar nuevas migraciones

1. **Nunca editar** una migración existente. Si necesitas cambiar algo, crea una nueva migración.
2. **Numeración secuencial**: `0001`, `0002`, ..., `0010`, `0011`.
3. **Un cambio por archivo**: cada migración debe hacer una cosa.
4. **Idempotencia**: cuando sea posible, haz los scripts re-ejecutables (`IF EXISTS`, `IF NOT EXISTS`).
5. **Nombres descriptivos**: `0008_Add_DuracionMinutos_To_Reservaciones.sql`.

## Herramientas recomendadas

- **SSMS** (SQL Server Management Studio) — GUI oficial
- **Azure Data Studio** — alternativa moderna y multiplataforma
- **sqlcmd** — CLI para automatización
- **Docker** — para levantar SQL Server sin instalación

## Documentación relacionada

- [Diagrama ERD](../docs/ERD.md)
- [Tabla Clientes](../docs/tablas/01-clientes.md)
- [Tabla Mesas](../docs/tablas/02-mesas.md)
- [Tabla Reservaciones](../docs/tablas/03-reservaciones.md)
- [Tabla Agendas](../docs/tablas/04-agendas.md)