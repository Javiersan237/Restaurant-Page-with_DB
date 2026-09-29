-- =====================================================================
-- ELYSEE RESERVAS - Migracion 0004
-- =====================================================================
-- Descripcion : Crea la tabla Agendas (bloques de tiempo reservables).
-- Autor       : Equipo ELYSEE
-- Fecha       : 2026-09-29
-- Idempotente : Si (elimina la tabla si existe antes de crearla)
-- Depende de  : 0001
-- =====================================================================

USE ElyseeDB;
GO

SET NOCOUNT ON;
GO

-- ---------------------------------------------------------------------
-- PASO 1: Eliminar la tabla si ya existe (idempotencia)
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Agendas', 'U') IS NOT NULL
BEGIN
    PRINT 'Aviso: La tabla Agendas ya existe. Eliminando...';

    DECLARE @sql NVARCHAR(MAX) = N'';
    SELECT @sql = @sql + N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
                 + N'.' + QUOTENAME(OBJECT_NAME(parent_object_id))
                 + N' DROP CONSTRAINT ' + QUOTENAME(name) + N';' + CHAR(10)
    FROM sys.foreign_keys
    WHERE referenced_object_id = OBJECT_ID('dbo.Agendas');

    IF @sql <> N''
    BEGIN
        EXEC sp_executesql @sql;
        PRINT 'FKs entrantes eliminadas.';
    END

    DROP TABLE dbo.Agendas;
    PRINT 'OK: Tabla Agendas eliminada.';
END
ELSE
BEGIN
    PRINT 'OK: La tabla Agendas no existia.';
END
GO

-- ---------------------------------------------------------------------
-- PASO 2: Crear la tabla Agendas
-- ---------------------------------------------------------------------
CREATE TABLE dbo.Agendas (
    AgendaID       INT IDENTITY(1,1) NOT NULL,
    Fecha          DATE              NOT NULL,
    HoraInicio     TIME(0)           NOT NULL,
    HoraFin        TIME(0)           NOT NULL,
    DuracionMin    INT               NOT NULL,
    Estado         NVARCHAR(20)      NOT NULL 
                   CONSTRAINT DF_Agendas_Estado DEFAULT ('Abierta'),
    FechaCreacion  DATETIME          NOT NULL 
                   CONSTRAINT DF_Agendas_FechaCreacion DEFAULT (GETDATE()),

    CONSTRAINT PK_Agendas PRIMARY KEY CLUSTERED (AgendaID),
    CONSTRAINT UQ_Agendas_Fecha_Horas UNIQUE (Fecha, HoraInicio, HoraFin),
    CONSTRAINT CK_Agendas_Horas CHECK (HoraFin > HoraInicio),
    CONSTRAINT CK_Agendas_Duracion CHECK (DuracionMin BETWEEN 30 AND 180),
    CONSTRAINT CK_Agendas_Estado CHECK (Estado IN ('Abierta','Cerrada'))
);
GO

PRINT 'OK: Tabla Agendas creada con exito.';
GO

-- ---------------------------------------------------------------------
-- PASO 3: Verificar
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Agendas', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Agendas NO se pudo crear.';
    RETURN;
END
GO

PRINT '';
PRINT '=== Estructura de la tabla Agendas ===';
SELECT 
    c.name        AS Columna,
    t.name        AS Tipo,
    c.max_length  AS Longitud,
    CASE c.is_nullable WHEN 1 THEN 'NULL' ELSE 'NOT NULL' END AS Nulabilidad,
    CASE c.is_identity WHEN 1 THEN 'IDENTITY' ELSE '' END    AS Identidad
FROM sys.columns c
INNER JOIN sys.types t ON t.user_type_id = c.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.Agendas')
ORDER BY c.column_id;
GO

PRINT '';
PRINT '=====================================================================';
PRINT '  Tabla Agendas lista.';
PRINT '  Siguiente paso: ejecutar 0005_Create_Reservaciones.sql';
PRINT '=====================================================================';
GO