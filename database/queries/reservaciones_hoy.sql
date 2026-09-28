-- =====================================================================
-- QUERY: reservaciones_hoy
-- =====================================================================
-- Proposito : Devuelve las reservaciones del dia actual con datos
--             completos del cliente y la mesa. Util para el hostess.
-- Uso       : Endpoint GET /api/reservaciones/hoy
-- Parametros:
--   Ninguno (usa GETDATE() internamente)
-- Devuelve  : Hora, NumeroMesa, Ubicacion, Cliente, NumeroPersonas,
--             Estado, Notas, Telefono
-- Orden     : Por hora ascendente
-- =====================================================================

USE ElyseeDB;
GO

-- ---------------------------------------------------------------------
-- QUERY
-- ---------------------------------------------------------------------
SELECT 
    r.ReservacionID,
    r.Hora,
    m.NumeroMesa,
    m.Ubicacion,
    c.Nombre + ' ' + c.Apellido AS Cliente,
    c.Telefono,
    c.EsVIP,
    r.NumeroPersonas,
    r.Estado,
    r.Notas
FROM dbo.Reservaciones r
INNER JOIN dbo.Clientes c ON c.ClienteID = r.ClienteID
INNER JOIN dbo.Mesas    m ON m.MesaID    = r.MesaID
WHERE r.Fecha = CAST(GETDATE() AS DATE)
  AND r.Estado IN ('Pendiente', 'Confirmada')
ORDER BY r.Hora ASC;
GO