-- =====================================================================
-- QUERY: disponibilidad_mesas
-- =====================================================================
-- Proposito : Devuelve las mesas disponibles para un bloque de tiempo.
-- Uso       : Endpoint GET /api/mesas/disponibles
-- Parametros:
--   @Fecha       DATE     - Fecha de la reservacion (ej: '2026-10-15')
--   @HoraInicio  TIME(0)  - Hora de inicio (ej: '19:00')
--   @HoraFin     TIME(0)  - Hora de fin (ej: '21:00')
--   @Personas    INT      - Numero de comensales (ej: 4)
-- Devuelve  : MesaID, NumeroMesa, Capacidad, Ubicacion
-- Logica    :
--   1. Filtra mesas con capacidad suficiente
--   2. Filtra mesas marcadas como Disponibles
--   3. Excluye mesas con reservacion activa cuyo bloque SE SOLAPE
--      con [@HoraInicio, @HoraFin]
-- =====================================================================

USE ElyseeDB;
GO

-- ---------------------------------------------------------------------
-- PARAMETROS (modificar para pruebas)
-- ---------------------------------------------------------------------
DECLARE @Fecha      DATE    = '2026-10-15';
DECLARE @HoraInicio TIME(0) = '19:00';
DECLARE @HoraFin    TIME(0) = '21:00';
DECLARE @Personas   INT     = 4;

-- ---------------------------------------------------------------------
-- QUERY
-- ---------------------------------------------------------------------
SELECT 
    m.MesaID,
    m.NumeroMesa,
    m.Capacidad,
    m.Ubicacion
FROM dbo.Mesas m
WHERE m.Capacidad >= @Personas
  AND m.Estado = 'Disponible'
  AND m.MesaID NOT IN (
      SELECT r.MesaID
      FROM dbo.Reservaciones r
      INNER JOIN dbo.Agendas a ON a.AgendaID = r.AgendaID
      WHERE a.Fecha = @Fecha
        AND a.HoraInicio < @HoraFin      -- condicion de solapamiento
        AND a.HoraFin    > @HoraInicio
        AND r.Estado IN ('Pendiente', 'Confirmada')
  )
ORDER BY 
    m.Capacidad ASC,
    CASE m.Ubicacion
        WHEN 'Terraza' THEN 1
        WHEN 'Salon Principal' THEN 2
        WHEN 'Salon Privado' THEN 3
        WHEN 'Bar' THEN 4
        ELSE 5
    END;
GO