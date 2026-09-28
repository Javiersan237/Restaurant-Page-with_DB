-- =====================================================================
-- ELYSEE RESERVAS - Migracion 0002
-- =====================================================================
-- Descripcion : Crea la tabla Clientes con sus restricciones.
-- Autor       : Equipo ELYSEE
-- Fecha       : 2026-09-28
-- Idempotente : Si
-- Depende de  : 0001_DropAndCreateDatabase.sql
-- =====================================================================

USE ElyseeDB;
GO

SET NOCOUNT ON;
GO


-- Eliminar la tabla si ya existe (idempotencia)

IF OBJECT_ID('dbo.Clientes', 'U') IS NOT NULL
BEGIN
    PRINT 'Aviso: La tabla Clientes ya existe. Eliminando...';

    -- Eliminar FKs entrantes de otras tablas si las hubiera
    -- (por ahora no hay, pero dejamos el patron preparado)
    DECLARE @sql NVARCHAR(MAX) = N'';
    SELECT @sql = @sql + N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
                 + N'.' + QUOTENAME(OBJECT_NAME(parent_object_id))
                 + N' DROP CONSTRAINT ' + QUOTENAME(name) + N';' + CHAR(10)
    FROM sys.foreign_keys
    WHERE referenced_object_id = OBJECT_ID('dbo.Clientes');

    IF @sql <> N''
    BEGIN
        EXEC sp_executesql @sql;
        PRINT 'FKs entrantes eliminadas.';
    END

    DROP TABLE dbo.Clientes;
    PRINT 'OK: Tabla Clientes eliminada.';
END
ELSE
BEGIN
    PRINT 'OK: La tabla Clientes no existia.';
END
GO

-- Crear la tabla Clientes

CREATE TABLE dbo.Clientes (
    ClienteID       INT IDENTITY(1,1)   NOT NULL,
    Nombre          NVARCHAR(100)       NOT NULL,
    Apellido        NVARCHAR(100)       NOT NULL,
    Email           NVARCHAR(150)       NOT NULL,
    Telefono        NVARCHAR(20)        NULL,
    Preferencias    NVARCHAR(500)       NULL,
    EsVIP           BIT                 NOT NULL CONSTRAINT DF_Clientes_EsVIP DEFAULT (0),
    FechaRegistro   DATETIME            NOT NULL CONSTRAINT DF_Clientes_FechaRegistro DEFAULT (GETDATE()),

    -- Primary Key
    CONSTRAINT PK_Clientes PRIMARY KEY CLUSTERED (ClienteID),

    -- Unique
    CONSTRAINT UQ_Clientes_Email UNIQUE (Email),

    -- Check constraints
    CONSTRAINT CK_Clientes_Email CHECK (Email LIKE '%_@_%._%'),
    CONSTRAINT CK_Clientes_Nombre CHECK (LEN(LTRIM(RTRIM(Nombre))) > 0),
    CONSTRAINT CK_Clientes_Apellido CHECK (LEN(LTRIM(RTRIM(Apellido))) > 0)
);
GO

PRINT 'OK: Tabla Clientes creada con exito.';
GO

-- Verificar que la tabla se creo correctamente

IF OBJECT_ID('dbo.Clientes', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Clientes NO se pudo crear.';
    RETURN;
END
GO


-- Mostrar resumen de la estructura creada

PRINT '';
PRINT '=== Estructura de la tabla Clientes ===';
SELECT 
    c.name              AS Columna,
    t.name              AS Tipo,
    c.max_length        AS Longitud,
    CASE c.is_nullable WHEN 1 THEN 'NULL' ELSE 'NOT NULL' END AS Nulabilidad,
    CASE c.is_identity WHEN 1 THEN 'IDENTITY' ELSE '' END    AS Identidad
FROM sys.columns c
INNER JOIN sys.types t ON t.user_type_id = c.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.Clientes')
ORDER BY c.column_id;
GO

PRINT '';
PRINT '=== Restricciones de la tabla Clientes ===';
SELECT 
    kc.name             AS Restriccion,
    kc.type_desc        AS Tipo,
    c.name              AS Columna
FROM sys.key_constraints kc
INNER JOIN sys.index_columns ic ON ic.object_id = kc.parent_object_id 
                                AND ic.index_id = kc.unique_index_id
INNER JOIN sys.columns c ON c.object_id = ic.object_id 
                        AND c.column_id = ic.column_id
WHERE kc.parent_object_id = OBJECT_ID('dbo.Clientes')
UNION ALL
SELECT 
    cc.name             AS Restriccion,
    'CHECK_CONSTRAINT'  AS Tipo,
    ''                  AS Columna
FROM sys.check_constraints cc
WHERE cc.parent_object_id = OBJECT_ID('dbo.Clientes')
ORDER BY Tipo, Restriccion;
GO

PRINT '';
PRINT '=====================================================================';
PRINT '  Tabla Clientes lista.';
PRINT '  Siguiente paso: ejecutar 0003_Create_Mesas.sql';
PRINT '=====================================================================';
GO