-- =====================================================================
-- QUERY: historial_cliente
-- =====================================================================
-- Proposito : Devuelve todas las reservaciones de un cliente especifico.
-- Uso       : Endpoint GET /api/reservaciones?cliente=:id
-- Parametros:
--   @ClienteID   INT  - ID del cliente (ej: 1)
-- Devuelve  : ReservacionID, Fecha, HoraInicio, HoraFin, DuracionMin,
--             NumeroPersonas, Estado, NumeroMesa, Ubicacion, Notas
-- Orden     : Mas recientes primero
-- =====================================================================

USE ElyseeDB;
GO

-- ---------------------------------------------------------------------
-- PARAMETROS (modificar para pruebas)
-- ---------------------------------------------------------------------
DECLARE @ClienteID INT = 1;

-- ---------------------------------------------------------------------
-- QUERY
-- ---------------------------------------------------------------------
SELECT 
    r.ReservacionID,
    a.Fecha,
    a.HoraInicio,
    a.HoraFin,
    a.DuracionMin,
    r.NumeroPersonas,
    r.Estado,
    r.Notas,
    r.FechaCreacion,
    m.NumeroMesa,
    m.Ubicacion,
    m.Capacidad
FROM dbo.Reservaciones r
INNER JOIN dbo.Agendas a ON a.AgendaID = r.AgendaID
INNER JOIN dbo.Mesas   m ON m.MesaID   = r.MesaID
WHERE r.ClienteID = @ClienteID
ORDER BY a.Fecha DESC, a.HoraInicio DESC;
GO