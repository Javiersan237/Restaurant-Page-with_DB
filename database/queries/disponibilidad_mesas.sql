-- =====================================================================
-- QUERY: disponibilidad_mesas
-- =====================================================================
-- Proposito : Devuelve las mesas disponibles para una fecha, hora y
--             numero de personas especificos.
-- Uso       : Endpoint GET /api/mesas/disponibles
-- Parametros:
--   @Fecha       DATE     - Fecha de la reservacion (ej: '2026-10-15')
--   @Hora        TIME(0)  - Hora de llegada (ej: '20:00')
--   @Personas    INT      - Numero de comensales (ej: 4)
-- Devuelve  : MesaID, NumeroMesa, Capacidad, Ubicacion
-- Logica    :
--   1. Filtra mesas con capacidad suficiente
--   2. Filtra mesas marcadas como Disponibles
--   3. Excluye mesas con reservacion activa en ventana de +/-1 hora
-- =====================================================================

USE ElyseeDB;
GO

-- ---------------------------------------------------------------------
-- PARAMETROS (modificar para pruebas)
-- ---------------------------------------------------------------------
DECLARE @Fecha    DATE    = '2026-10-15';
DECLARE @Hora     TIME(0) = '20:00';
DECLARE @Personas INT     = 4;

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
      WHERE r.Fecha = @Fecha
        AND r.Hora BETWEEN DATEADD(HOUR, -1, @Hora) AND DATEADD(HOUR, 1, @Hora)
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