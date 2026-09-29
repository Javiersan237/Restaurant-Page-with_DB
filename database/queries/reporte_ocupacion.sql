-- =====================================================================
-- QUERY: reporte_ocupacion
-- =====================================================================
-- Proposito : Genera un reporte de ocupacion agrupado por fecha dentro
--             de un rango. Util para dashboards y administracion.
-- Uso       : Endpoint GET /api/reportes/ocupacion
-- Parametros:
--   @FechaInicio DATE - Fecha inicial del rango (inclusive)
--   @FechaFin    DATE - Fecha final del rango (inclusive)
-- Devuelve  : Fecha, TotalReservaciones, TotalPersonas, MesasUsadas,
--             Completadas, Canceladas, NoShow, Activas
-- Orden     : Por fecha ascendente
-- =====================================================================

USE ElyseeDB;
GO

-- ---------------------------------------------------------------------
-- PARAMETROS (modificar para pruebas)
-- ---------------------------------------------------------------------
DECLARE @FechaInicio DATE = '2026-10-01';
DECLARE @FechaFin    DATE = '2026-10-31';

-- ---------------------------------------------------------------------
-- QUERY 1: Reporte por fecha
-- ---------------------------------------------------------------------
SELECT 
    a.Fecha,
    COUNT(*)                                        AS TotalReservaciones,
    SUM(r.NumeroPersonas)                           AS TotalPersonas,
    COUNT(DISTINCT r.MesaID)                        AS MesasUsadas,
    SUM(CASE WHEN r.Estado = 'Completada' THEN 1 ELSE 0 END) AS Completadas,
    SUM(CASE WHEN r.Estado = 'Cancelada'  THEN 1 ELSE 0 END) AS Canceladas,
    SUM(CASE WHEN r.Estado = 'NoShow'     THEN 1 ELSE 0 END) AS NoShow,
    SUM(CASE WHEN r.Estado IN ('Pendiente', 'Confirmada') THEN 1 ELSE 0 END) AS Activas
FROM dbo.Reservaciones r
INNER JOIN dbo.Agendas a ON a.AgendaID = r.AgendaID
WHERE a.Fecha BETWEEN @FechaInicio AND @FechaFin
GROUP BY a.Fecha
ORDER BY a.Fecha ASC;
GO

-- ---------------------------------------------------------------------
-- QUERY 2 (VARIANTE): Reporte por zona en un rango
-- ---------------------------------------------------------------------
DECLARE @FechaInicio2 DATE = '2026-10-01';
DECLARE @FechaFin2    DATE = '2026-10-31';

SELECT 
    m.Ubicacion,
    COUNT(*)                    AS TotalReservaciones,
    SUM(r.NumeroPersonas)       AS TotalPersonas,
    AVG(r.NumeroPersonas * 1.0) AS PromedioPersonas
FROM dbo.Reservaciones r
INNER JOIN dbo.Agendas a ON a.AgendaID = r.AgendaID
INNER JOIN dbo.Mesas   m ON m.MesaID   = r.MesaID
WHERE a.Fecha BETWEEN @FechaInicio2 AND @FechaFin2
  AND r.Estado IN ('Confirmada', 'Completada')
GROUP BY m.Ubicacion
ORDER BY TotalReservaciones DESC;
GO