-- =====================================================================
-- QUERY: reservaciones_hoy
-- =====================================================================
-- Proposito : Devuelve las reservaciones del dia actual con datos
--             completos del cliente, mesa y bloque horario.
-- Uso       : Endpoint GET /api/reservaciones/hoy
-- Parametros: Ninguno (usa GETDATE() internamente)
-- Devuelve  : HoraInicio, HoraFin, DuracionMin, NumeroMesa, Ubicacion,
--             Cliente, Telefono, NumeroPersonas, Estado, Notas
-- Orden     : Por hora de inicio ascendente
-- =====================================================================

USE ElyseeDB;
GO

-- ---------------------------------------------------------------------
-- QUERY
-- ---------------------------------------------------------------------
SELECT 
    r.ReservacionID,
    a.HoraInicio,
    a.HoraFin,
    a.DuracionMin,
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
INNER JOIN dbo.Agendas  a ON a.AgendaID  = r.AgendaID
WHERE a.Fecha = CAST(GETDATE() AS DATE)
  AND r.Estado IN ('Pendiente', 'Confirmada')
ORDER BY a.HoraInicio ASC;
GO