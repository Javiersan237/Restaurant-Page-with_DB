-- =====================================================================
-- QUERY: historial_cliente
-- =====================================================================
-- Proposito : Devuelve todas las reservaciones de un cliente especifico.
-- Uso       : Endpoint GET /api/reservaciones?cliente=:id
-- Parametros:
--   @ClienteID   INT  - ID del cliente (ej: 1)
-- Devuelve  : ReservacionID, Fecha, Hora, NumeroPersonas, Estado,
--             NumeroMesa, Ubicacion, Notas, FechaCreacion
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
    r.Fecha,
    r.Hora,
    r.NumeroPersonas,
    r.Estado,
    r.Notas,
    r.FechaCreacion,
    m.NumeroMesa,
    m.Ubicacion,
    m.Capacidad
FROM dbo.Reservaciones r
INNER JOIN dbo.Mesas m ON m.MesaID = r.MesaID
WHERE r.ClienteID = @ClienteID
ORDER BY r.Fecha DESC, r.Hora DESC;
GO