# 🔍 Queries SQL Reutilizables

Consultas SQL listas para usar en el backend. Cada archivo contiene una
query con parámetros (`@Nombre`) que el backend reemplazará con valores.

## Convenciones

- **Parámetros**: siempre `@NombreParametro` (PascalCase).
- **Alias**: usar nombres descriptivos en español (`Cliente`, `Mesa`, etc.).
- **Formato**: cada query viene con un comentario de cabecera que explica
  qué hace, qué parámetros recibe y qué devuelve.
- **Uso en backend**: el backend usa `mssql` con `request.input('param', value)`
  para inyectar parámetros de forma segura (previene SQL injection).

## Índice de queries

| Archivo | Uso en backend | Endpoint |
|---------|---------------|----------|
| `disponibilidad_mesas.sql` | Consultar mesas libres por fecha/hora/personas | `GET /api/mesas/disponibles` |
| `historial_cliente.sql` | Reservaciones de un cliente específico | `GET /api/reservaciones?cliente=:id` |
| `reservaciones_hoy.sql` | Reservaciones del día actual (hostess) | `GET /api/reservaciones/hoy` |
| `reporte_ocupacion.sql` | Reporte de ocupación en un rango de fechas | `GET /api/reportes/ocupacion` |

## Cómo probar una query

1. Abre el archivo `.sql` en SSMS.
2. Reemplaza los `DECLARE @X = ...` con valores de prueba.
3. Ejecuta con `F5`.
4. Verifica que los resultados sean coherentes.

## Cómo usarla en el backend (Node.js + mssql)

```javascript
const sql = require('mssql');

async function getMesasDisponibles(fecha, hora, personas) {
  const pool = await sql.connect(config);
  const request = pool.request();
  
  request.input('Fecha', sql.Date, fecha);
  request.input('Hora', sql.VarChar, hora);
  request.input('Personas', sql.Int, personas);
  
  const result = await request.query(`
    SELECT m.MesaID, m.NumeroMesa, m.Capacidad, m.Ubicacion
    FROM Mesas m
    WHERE m.Capacidad >= @Personas
      AND m.Estado = 'Disponible'
      AND m.MesaID NOT IN (
          SELECT r.MesaID
          FROM Reservaciones r
          WHERE r.Fecha = @Fecha
            AND r.Hora BETWEEN DATEADD(HOUR, -1, @Hora) AND DATEADD(HOUR, 1, @Hora)
            AND r.Estado IN ('Pendiente', 'Confirmada')
      )
    ORDER BY m.Capacidad ASC, m.Ubicacion;
  `);
  
  return result.recordset;
}
```

**Regla de oro**: **nunca** concatenar strings para formar SQL. Siempre
usar `request.input()` para pasar parámetros.