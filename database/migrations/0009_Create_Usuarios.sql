-- =====================================================================
-- ELYSEE RESERVAS - Migracion 0009
-- =====================================================================
-- Descripcion : Crea la tabla Usuarios para administradores.
-- Autor       : Equipo ELYSEE
-- Fecha       : 2026-10-06
-- Idempotente : Si (elimina la tabla si existe antes de crearla)
-- Depende de  : 0001-0008
-- =====================================================================

USE ElyseeDB;
GO

SET NOCOUNT ON;
GO

-- ---------------------------------------------------------------------
-- PASO 1: Eliminar la tabla si existe (idempotencia)
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Usuarios', 'U') IS NOT NULL
BEGIN
    PRINT 'Aviso: La tabla Usuarios ya existe. Eliminando...';
    DROP TABLE dbo.Usuarios;
    PRINT 'OK: Tabla Usuarios eliminada.';
END
ELSE
BEGIN
    PRINT 'OK: La tabla Usuarios no existia.';
END
GO

-- ---------------------------------------------------------------------
-- PASO 2: Crear la tabla Usuarios
-- ---------------------------------------------------------------------
CREATE TABLE dbo.Usuarios (
    UsuarioID       INT IDENTITY(1,1) NOT NULL,
    Email           NVARCHAR(150)     NOT NULL,
    PasswordHash    NVARCHAR(255)     NOT NULL,
    Nombre          NVARCHAR(100)     NOT NULL,
    Rol             NVARCHAR(20)      NOT NULL 
                    CONSTRAINT DF_Usuarios_Rol DEFAULT 'admin',
    Activo          BIT               NOT NULL 
                    CONSTRAINT DF_Usuarios_Activo DEFAULT 1,
    UltimoLogin     DATETIME          NULL,
    FechaCreacion   DATETIME          NOT NULL 
                    CONSTRAINT DF_Usuarios_FechaCreacion DEFAULT GETDATE(),

    CONSTRAINT PK_Usuarios PRIMARY KEY CLUSTERED (UsuarioID),
    CONSTRAINT UQ_Usuarios_Email UNIQUE (Email),
    CONSTRAINT CK_Usuarios_Rol CHECK (Rol IN ('admin', 'staff'))
);
GO

PRINT 'OK: Tabla Usuarios creada con exito.';
GO

-- ---------------------------------------------------------------------
-- PASO 3: Crear indice para busquedas por email
-- ---------------------------------------------------------------------
CREATE NONCLUSTERED INDEX IX_Usuarios_Email
    ON dbo.Usuarios(Email)
    INCLUDE (UsuarioID, Nombre, Rol, Activo);
GO

PRINT 'OK: Indice IX_Usuarios_Email creado.';
GO

-- ---------------------------------------------------------------------
-- PASO 4: Verificar
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Usuarios', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Usuarios NO se pudo crear.';
    RETURN;
END

PRINT '';
PRINT '=== Estructura de la tabla Usuarios ===';
SELECT 
    c.name        AS Columna,
    t.name        AS Tipo,
    c.max_length  AS Longitud,
    CASE c.is_nullable WHEN 1 THEN 'NULL' ELSE 'NOT NULL' END AS Nulabilidad,
    CASE c.is_identity WHEN 1 THEN 'IDENTITY' ELSE '' END     AS Identidad
FROM sys.columns c
INNER JOIN sys.types t ON t.user_type_id = c.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.Usuarios')
ORDER BY c.column_id;
GO

PRINT '';
PRINT '=====================================================================';
PRINT '  Tabla Usuarios lista.';
PRINT '  Siguiente paso: ejecutar 0010_Insert_Admin_User.sql';
PRINT '=====================================================================';
GO