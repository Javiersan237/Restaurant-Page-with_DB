-- =====================================================================
-- ELYSEE RESERVAS - Migracion 0005
-- =====================================================================
-- Descripcion : Crea la tabla Reservaciones (puente con 3 FKs).
-- Autor       : Equipo ELYSEE
-- Fecha       : 2026-09-29
-- Idempotente : Si
-- Depende de  : 0001, 0002 (Clientes), 0003 (Mesas), 0004 (Agendas)
-- =====================================================================

USE ElyseeDB;
GO

SET NOCOUNT ON;
GO

-- ---------------------------------------------------------------------
-- PASO 0: Verificar prerequisitos
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Clientes', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Clientes no existe. Ejecuta primero 0002_Create_Clientes.sql';
    RETURN;
END
IF OBJECT_ID('dbo.Mesas', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Mesas no existe. Ejecuta primero 0003_Create_Mesas.sql';
    RETURN;
END
IF OBJECT_ID('dbo.Agendas', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Agendas no existe. Ejecuta primero 0004_Create_Agendas.sql';
    RETURN;
END

PRINT 'OK: Prerequisitos verificados (Clientes, Mesas, Agendas existen).';
GO

-- ---------------------------------------------------------------------
-- PASO 1: Eliminar la tabla si ya existe (idempotencia)
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Reservaciones', 'U') IS NOT NULL
BEGIN
    PRINT 'Aviso: La tabla Reservaciones ya existe. Eliminando...';

    DECLARE @sql NVARCHAR(MAX) = N'';
    SELECT @sql = @sql + N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
                 + N'.' + QUOTENAME(OBJECT_NAME(parent_object_id))
                 + N' DROP CONSTRAINT ' + QUOTENAME(name) + N';' + CHAR(10)
    FROM sys.foreign_keys
    WHERE referenced_object_id = OBJECT_ID('dbo.Reservaciones');

    IF @sql <> N''
    BEGIN
        EXEC sp_executesql @sql;
        PRINT 'FKs entrantes eliminadas.';
    END

    DROP TABLE dbo.Reservaciones;
    PRINT 'OK: Tabla Reservaciones eliminada.';
END
ELSE
BEGIN
    PRINT 'OK: La tabla Reservaciones no existia.';
END
GO

-- ---------------------------------------------------------------------
-- PASO 2: Crear la tabla Reservaciones (puente con 3 FKs)
-- ---------------------------------------------------------------------
CREATE TABLE dbo.Reservaciones (
    ReservacionID   INT IDENTITY(1,1) NOT NULL,
    ClienteID       INT               NOT NULL,
    MesaID          INT               NOT NULL,
    AgendaID        INT               NOT NULL,
    NumeroPersonas  INT               NOT NULL,
    Estado          NVARCHAR(20)      NOT NULL 
                    CONSTRAINT DF_Reservaciones_Estado DEFAULT ('Pendiente'),
    Notas           NVARCHAR(300)     NULL,
    FechaCreacion   DATETIME          NOT NULL 
                    CONSTRAINT DF_Reservaciones_FechaCreacion DEFAULT (GETDATE()),

    -- Primary Key
    CONSTRAINT PK_Reservaciones PRIMARY KEY CLUSTERED (ReservacionID),

    -- Foreign Keys (3 FKs: Cliente, Mesa, Agenda)
    CONSTRAINT FK_Reservaciones_Clientes 
        FOREIGN KEY (ClienteID) REFERENCES dbo.Clientes(ClienteID)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT FK_Reservaciones_Mesas 
        FOREIGN KEY (MesaID) REFERENCES dbo.Mesas(MesaID)
        ON DELETE NO ACTION ON UPDATE CASCADE,

    CONSTRAINT FK_Reservaciones_Agendas 
        FOREIGN KEY (AgendaID) REFERENCES dbo.Agendas(AgendaID)
        ON DELETE NO ACTION ON UPDATE CASCADE,

    -- Check constraints
    CONSTRAINT CK_Reservaciones_Estado CHECK (
        Estado IN ('Pendiente','Confirmada','Cancelada','Completada','NoShow')
    ),
    CONSTRAINT CK_Reservaciones_Personas CHECK (NumeroPersonas BETWEEN 1 AND 20)
);
GO

PRINT 'OK: Tabla Reservaciones creada con exito.';
GO

-- ---------------------------------------------------------------------
-- PASO 3: Verificar
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Reservaciones', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Reservaciones NO se pudo crear.';
    RETURN;
END
GO

PRINT '';
PRINT '=== Estructura de la tabla Reservaciones ===';
SELECT 
    c.name        AS Columna,
    t.name        AS Tipo,
    c.max_length  AS Longitud,
    CASE c.is_nullable WHEN 1 THEN 'NULL' ELSE 'NOT NULL' END AS Nulabilidad,
    CASE c.is_identity WHEN 1 THEN 'IDENTITY' ELSE '' END    AS Identidad
FROM sys.columns c
INNER JOIN sys.types t ON t.user_type_id = c.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.Reservaciones')
ORDER BY c.column_id;
GO

PRINT '';
PRINT '=== Foreign Keys de Reservaciones ===';
SELECT 
    fk.name                     AS FK,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ColumnaOrigen,
    OBJECT_NAME(fk.referenced_object_id) AS TablaDestino,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ColumnaDestino,
    fk.delete_referential_action_desc AS OnDelete
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
WHERE fk.parent_object_id = OBJECT_ID('dbo.Reservaciones')
ORDER BY fk.name;
GO

PRINT '';
PRINT '=====================================================================';
PRINT '  Tabla Reservaciones lista.';
PRINT '  Siguiente paso: ejecutar 0006_Create_Indexes.sql';
PRINT '=====================================================================';
GO