-- =====================================================================
-- ELYSEE RESERVAS - Migracion 0003
-- =====================================================================
-- Descripcion : Crea la tabla Mesas con validaciones de capacidad y estado.
-- Autor       : Equipo ELYSEE
-- Fecha       : 2026-09-28
-- Idempotente : Si
-- Depende de  : 0001_DropAndCreateDatabase.sql
-- =====================================================================

USE ElyseeDB;
GO

SET NOCOUNT ON;
GO

-- Eliminar la tabla si ya existe 

IF OBJECT_ID('dbo.Mesas', 'U') IS NOT NULL
BEGIN
    PRINT 'Aviso: La tabla Mesas ya existe. Eliminando...';

    -- Eliminar FKs entrantes de otras tablas si las hubiera
    DECLARE @sql NVARCHAR(MAX) = N'';
    SELECT @sql = @sql + N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
                 + N'.' + QUOTENAME(OBJECT_NAME(parent_object_id))
                 + N' DROP CONSTRAINT ' + QUOTENAME(name) + N';' + CHAR(10)
    FROM sys.foreign_keys
    WHERE referenced_object_id = OBJECT_ID('dbo.Mesas');

    IF @sql <> N''
    BEGIN
        EXEC sp_executesql @sql;
        PRINT 'FKs entrantes eliminadas.';
    END

    DROP TABLE dbo.Mesas;
    PRINT 'OK: Tabla Mesas eliminada.';
END
ELSE
BEGIN
    PRINT 'OK: La tabla Mesas no existia.';
END
GO

-- Crear la tabla Mesas

CREATE TABLE dbo.Mesas (
    MesaID          INT IDENTITY(1,1)   NOT NULL,
    NumeroMesa      NVARCHAR(10)        NOT NULL,
    Capacidad       INT                 NOT NULL,
    Ubicacion       NVARCHAR(50)        NOT NULL,
    Estado          NVARCHAR(20)        NOT NULL 
                    CONSTRAINT DF_Mesas_Estado DEFAULT ('Disponible'),

    -- Primary Key
    CONSTRAINT PK_Mesas PRIMARY KEY CLUSTERED (MesaID),

    -- Unique
    CONSTRAINT UQ_Mesas_NumeroMesa UNIQUE (NumeroMesa),

    -- Check constraints
    CONSTRAINT CK_Mesas_Capacidad CHECK (Capacidad BETWEEN 1 AND 20),
    CONSTRAINT CK_Mesas_Estado CHECK (
        Estado IN ('Disponible', 'Ocupada', 'Reservada', 'Mantenimiento')
    ),
    CONSTRAINT CK_Mesas_NumeroMesa CHECK (LEN(LTRIM(RTRIM(NumeroMesa))) > 0),
    CONSTRAINT CK_Mesas_Ubicacion CHECK (LEN(LTRIM(RTRIM(Ubicacion))) > 0)
);
GO

PRINT 'OK: Tabla Mesas creada con exito.';
GO

-- Verificar que la tabla se creo correctamente

IF OBJECT_ID('dbo.Mesas', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Mesas NO se pudo crear.';
    RETURN;
END
GO


-- Mostrar resumen de la estructura creada

PRINT '';
PRINT '=== Estructura de la tabla Mesas ===';
SELECT 
    c.name              AS Columna,
    t.name              AS Tipo,
    c.max_length        AS Longitud,
    CASE c.is_nullable WHEN 1 THEN 'NULL' ELSE 'NOT NULL' END AS Nulabilidad,
    CASE c.is_identity WHEN 1 THEN 'IDENTITY' ELSE '' END    AS Identidad
FROM sys.columns c
INNER JOIN sys.types t ON t.user_type_id = c.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.Mesas')
ORDER BY c.column_id;
GO

PRINT '';
PRINT '=== Restricciones de la tabla Mesas ===';
SELECT 
    kc.name             AS Restriccion,
    kc.type_desc        AS Tipo,
    c.name              AS Columna
FROM sys.key_constraints kc
INNER JOIN sys.index_columns ic ON ic.object_id = kc.parent_object_id 
                                AND ic.index_id = kc.unique_index_id
INNER JOIN sys.columns c ON c.object_id = ic.object_id 
                        AND c.column_id = ic.column_id
WHERE kc.parent_object_id = OBJECT_ID('dbo.Mesas')
UNION ALL
SELECT 
    cc.name             AS Restriccion,
    'CHECK_CONSTRAINT'  AS Tipo,
    ''                  AS Columna
FROM sys.check_constraints cc
WHERE cc.parent_object_id = OBJECT_ID('dbo.Mesas')
ORDER BY Tipo, Restriccion;
GO

PRINT '';
PRINT '=== Valores permitidos en Estado ===';
PRINT 'Disponible | Ocupada | Reservada | Mantenimiento';
GO

PRINT '';
PRINT '=====================================================================';
PRINT '  Tabla Mesas lista.';
PRINT '  Siguiente paso: ejecutar 0004_Create_Reservaciones.sql';
PRINT '=====================================================================';
GO