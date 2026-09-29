-- =====================================================================
-- ELYSEE RESERVAS - Migracion 0001
-- =====================================================================
-- Descripcion : Crea la base de datos ElyseeDB.
-- Autor       : Equipo ELYSEE
-- Fecha       : 2026-09-27
-- Idempotente : Si 
-- =====================================================================
-- SQL Server  : 2022 (MSSQL16.MSSQLSERVER)
-- =====================================================================

USE master;
GO

-- Eliminar la base de datos si ya existe

IF DB_ID('ElyseeDB') IS NOT NULL
BEGIN
    PRINT 'Aviso: La base de datos ElyseeDB ya existe. Eliminando...';

    -- Forzar desconexion de usuarios activos
    ALTER DATABASE ElyseeDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

    DROP DATABASE ElyseeDB;

    PRINT 'OK: Base de datos ElyseeDB eliminada.';
END
ELSE
BEGIN
    PRINT 'OK: La base de datos ElyseeDB no existia.';
END


-- Crear la base de datos con rutas explicitas

CREATE DATABASE ElyseeDB
ON PRIMARY (
    NAME        = 'ElyseeDB_Data',
    FILENAME    = 'C:\Program Files\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQL\DATA\ElyseeDB.mdf',
    SIZE        = 10MB,
    MAXSIZE     = 500MB,
    FILEGROWTH  = 10MB
)
LOG ON (
    NAME        = 'ElyseeDB_Log',
    FILENAME    = 'C:\Program Files\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQL\DATA\ElyseeDB_log.ldff',
    SIZE        = 5MB,
    MAXSIZE     = 100MB,
    FILEGROWTH  = 5MB
);
GO

-- Configurar collation correcta (para acentos y enie)

ALTER DATABASE ElyseeDB COLLATE SQL_Latin1_General_CP1_CI_AS;
GO

PRINT 'OK: Base de datos ElyseeDB creada con exito.';
PRINT 'Collation: SQL_Latin1_General_CP1_CI_AS';
GO

-- Seleccionar la BD para las siguientes migraciones

USE ElyseeDB;
GO

PRINT '';
PRINT '=====================================================================';
PRINT '  Base de datos ElyseeDB lista para migrar.';
PRINT '  Siguiente paso: ejecutar 0002_Create_Clientes.sql';
PRINT '=====================================================================';
GO