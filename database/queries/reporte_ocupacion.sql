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
--             ReservacionesCompletadas, ReservacionesCanceladas
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
-- QUERY
-- ---------------------------------------------------------------------
SELECT 
    r.Fecha,
    COUNT(*)                                        AS TotalReservaciones,
    SUM(r.NumeroPersonas)                           AS TotalPersonas,
    COUNT(DISTINCT r.MesaID)                        AS MesasUsadas,
    SUM(CASE WHEN r.Estado = 'Completada' THEN 1 ELSE 0 END) AS Completadas,
    SUM(CASE WHEN r.Estado = 'Cancelada'  THEN 1 ELSE 0 END) AS Canceladas,
    SUM(CASE WHEN r.Estado = 'NoShow'     THEN 1 ELSE 0 END) AS NoShow,
    SUM(CASE WHEN r.Estado IN ('Pendiente', 'Confirmada') THEN 1 ELSE 0 END) AS Activas
FROM dbo.Reservaciones r
WHERE r.Fecha BETWEEN @FechaInicio AND @FechaFin
GROUP BY r.Fecha
ORDER BY r.Fecha ASC;
GO