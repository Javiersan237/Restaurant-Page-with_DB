-- =====================================================================
-- ELYSEE RESERVAS - Migracion 0006
-- =====================================================================
-- Descripcion : Crea indices para las consultas mas frecuentes.
-- Autor       : Equipo ELYSEE
-- Fecha       : 2026-09-29
-- Idempotente : Si
-- Depende de  : 0001-0005
-- =====================================================================

USE ElyseeDB;
GO

SET NOCOUNT ON;
GO

-- ---------------------------------------------------------------------
-- PASO 0: Verificar prerequisitos
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Reservaciones', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Reservaciones no existe. Ejecuta primero 0005_Create_Reservaciones.sql';
    RETURN;
END
IF OBJECT_ID('dbo.Agendas', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Agendas no existe. Ejecuta primero 0004_Create_Agendas.sql';
    RETURN;
END

PRINT 'OK: Prerequisitos verificados.';
GO

-- ---------------------------------------------------------------------
-- PASO 1: Eliminar indices si ya existen (idempotencia)
-- ---------------------------------------------------------------------
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reservaciones_Agenda' 
           AND object_id = OBJECT_ID('dbo.Reservaciones'))
BEGIN
    DROP INDEX IX_Reservaciones_Agenda ON dbo.Reservaciones;
    PRINT 'OK: IX_Reservaciones_Agenda eliminado.';
END

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reservaciones_Mesa_Agenda' 
           AND object_id = OBJECT_ID('dbo.Reservaciones'))
BEGIN
    DROP INDEX IX_Reservaciones_Mesa_Agenda ON dbo.Reservaciones;
    PRINT 'OK: IX_Reservaciones_Mesa_Agenda eliminado.';
END

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reservaciones_Cliente' 
           AND object_id = OBJECT_ID('dbo.Reservaciones'))
BEGIN
    DROP INDEX IX_Reservaciones_Cliente ON dbo.Reservaciones;
    PRINT 'OK: IX_Reservaciones_Cliente eliminado.';
END

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reservaciones_Estado' 
           AND object_id = OBJECT_ID('dbo.Reservaciones'))
BEGIN
    DROP INDEX IX_Reservaciones_Estado ON dbo.Reservaciones;
    PRINT 'OK: IX_Reservaciones_Estado eliminado.';
END

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Agendas_Fecha_Horas' 
           AND object_id = OBJECT_ID('dbo.Agendas'))
BEGIN
    DROP INDEX IX_Agendas_Fecha_Horas ON dbo.Agendas;
    PRINT 'OK: IX_Agendas_Fecha_Horas eliminado.';
END

PRINT '';
PRINT 'Indices previos verificados.';
GO

-- ---------------------------------------------------------------------
-- PASO 2: Crear los indices
-- ---------------------------------------------------------------------

-- Indice 1: Reservaciones por Agenda (para JOIN con Agendas)
CREATE NONCLUSTERED INDEX IX_Reservaciones_Agenda
    ON dbo.Reservaciones(AgendaID)
    INCLUDE (MesaID, ClienteID, Estado);
GO
PRINT 'OK: IX_Reservaciones_Agenda creado.';

-- Indice 2: Solapamiento por mesa (JOIN mesa + agenda)
-- Este es el indice CLAVE para validar solapamiento
CREATE NONCLUSTERED INDEX IX_Reservaciones_Mesa_Agenda
    ON dbo.Reservaciones(MesaID, AgendaID)
    INCLUDE (Estado, NumeroPersonas);
GO
PRINT 'OK: IX_Reservaciones_Mesa_Agenda creado.';

-- Indice 3: Historial de reservaciones de un cliente
CREATE NONCLUSTERED INDEX IX_Reservaciones_Cliente
    ON dbo.Reservaciones(ClienteID)
    INCLUDE (AgendaID, MesaID, Estado);
GO
PRINT 'OK: IX_Reservaciones_Cliente creado.';

-- Indice 4: Filtrar reservaciones por estado
CREATE NONCLUSTERED INDEX IX_Reservaciones_Estado
    ON dbo.Reservaciones(Estado)
    INCLUDE (AgendaID, MesaID, ClienteID);
GO
PRINT 'OK: IX_Reservaciones_Estado creado.';

-- Indice 5: Buscar agendas por fecha/hora
CREATE NONCLUSTERED INDEX IX_Agendas_Fecha_Horas
    ON dbo.Agendas(Fecha, HoraInicio, HoraFin)
    INCLUDE (DuracionMin, Estado);
GO
PRINT 'OK: IX_Agendas_Fecha_Horas creado.';

PRINT '';
PRINT 'OK: Todos los indices creados con exito.';
GO

-- ---------------------------------------------------------------------
-- PASO 3: Verificar
-- ---------------------------------------------------------------------
PRINT '';
PRINT '=== Indices de Reservaciones ===';
SELECT 
    i.name              AS Indice,
    i.type_desc         AS Tipo
FROM sys.indexes i
WHERE i.object_id = OBJECT_ID('dbo.Reservaciones')
  AND i.type > 0
ORDER BY i.name;
GO

PRINT '';
PRINT '=== Indices de Agendas ===';
SELECT 
    i.name              AS Indice,
    i.type_desc         AS Tipo
FROM sys.indexes i
WHERE i.object_id = OBJECT_ID('dbo.Agendas')
  AND i.type > 0
ORDER BY i.name;
GO

PRINT '';
PRINT '=====================================================================';
PRINT '  Indices creados.';
PRINT '  Siguiente paso: ejecutar 0007_Insert_DatosIniciales.sql';
PRINT '=====================================================================';
GO