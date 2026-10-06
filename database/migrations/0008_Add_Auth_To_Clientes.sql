-- =====================================================================
-- ELYSEE RESERVAS - Migracion 0008
-- =====================================================================
-- Descripcion : Agrega columnas de autenticacion a la tabla Clientes.
-- Autor       : Equipo ELYSEE
-- Fecha       : 2026-10-06
-- Idempotente : Si (verifica con COL_LENGTH antes de agregar)
-- Depende de  : 0001-0007
-- =====================================================================

USE ElyseeDB;
GO

SET NOCOUNT ON;
GO

-- Verificar prerequisito
IF OBJECT_ID('dbo.Clientes', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Clientes no existe. Ejecuta primero 0002_Create_Clientes.sql';
    RETURN;
END

PRINT 'OK: Prerequisitos verificados.';
GO

-- ---------------------------------------------------------------------
-- PASO 1: Agregar columna PasswordHash (NVARCHAR 255, nullable)
-- ---------------------------------------------------------------------
IF COL_LENGTH('dbo.Clientes', 'PasswordHash') IS NULL
BEGIN
    ALTER TABLE dbo.Clientes ADD PasswordHash NVARCHAR(255) NULL;
    PRINT 'OK: Columna PasswordHash agregada.';
END
ELSE
BEGIN
    PRINT 'Aviso: La columna PasswordHash ya existe. Omitiendo.';
END
GO

-- ---------------------------------------------------------------------
-- PASO 2: Agregar columna Activo (BIT, default 1)
-- ---------------------------------------------------------------------
IF COL_LENGTH('dbo.Clientes', 'Activo') IS NULL
BEGIN
    ALTER TABLE dbo.Clientes ADD Activo BIT NOT NULL
        CONSTRAINT DF_Clientes_Activo DEFAULT 1;
    PRINT 'OK: Columna Activo agregada.';
END
ELSE
BEGIN
    PRINT 'Aviso: La columna Activo ya existe. Omitiendo.';
END
GO

-- ---------------------------------------------------------------------
-- PASO 3: Agregar columna UltimoLogin (DATETIME, nullable)
-- ---------------------------------------------------------------------
IF COL_LENGTH('dbo.Clientes', 'UltimoLogin') IS NULL
BEGIN
    ALTER TABLE dbo.Clientes ADD UltimoLogin DATETIME NULL;
    PRINT 'OK: Columna UltimoLogin agregada.';
END
ELSE
BEGIN
    PRINT 'Aviso: La columna UltimoLogin ya existe. Omitiendo.';
END
GO

-- ---------------------------------------------------------------------
-- PASO 4: Verificar la estructura actualizada
-- ---------------------------------------------------------------------
PRINT '';
PRINT '=== Estructura de la tabla Clientes ===';
SELECT 
    c.name        AS Columna,
    t.name        AS Tipo,
    c.max_length  AS Longitud,
    CASE c.is_nullable WHEN 1 THEN 'NULL' ELSE 'NOT NULL' END AS Nulabilidad
FROM sys.columns c
INNER JOIN sys.types t ON t.user_type_id = c.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.Clientes')
ORDER BY c.column_id;
GO

PRINT '';
PRINT '=====================================================================';
PRINT '  Migracion 0008 completada.';
PRINT '  Siguiente paso: ejecutar 0009_Create_Usuarios.sql';
PRINT '=====================================================================';
GO