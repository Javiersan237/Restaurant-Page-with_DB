-- =====================================================================
-- QUERY: limpieza_agendas
-- =====================================================================
-- Proposito : Elimina agendas vencidas SIN reservaciones (lazy cleanup).
-- Uso       : Se ejecuta antes de consultar agendas o crear reservaciones.
-- Parametros: Ninguno (usa GETDATE() internamente)
-- Devuelve  : Cantidad de filas eliminadas
-- Logica    :
--   1. Solo borra agendas SIN reservaciones asociadas (NOT IN)
--   2. Solo borra agendas VENCIDAS:
--      - Fecha < hoy, o
--      - Fecha = hoy Y HoraFin < hora actual
-- =====================================================================

USE ElyseeDB;
GO

-- ---------------------------------------------------------------------
-- QUERY
-- ---------------------------------------------------------------------
DELETE FROM dbo.Agendas
WHERE AgendaID NOT IN (SELECT DISTINCT AgendaID FROM dbo.Reservaciones)
  AND (
      Fecha < CAST(GETDATE() AS DATE)
      OR (Fecha = CAST(GETDATE() AS DATE) AND HoraFin < CAST(GETDATE() AS TIME))
  );

PRINT 'Agendas vencidas eliminadas: ' + CAST(@@ROWCOUNT AS NVARCHAR(10));
GO