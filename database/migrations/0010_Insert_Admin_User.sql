-- =====================================================================
-- ELYSEE RESERVAS - Migracion 0010
-- =====================================================================
-- Descripcion : Inserta el usuario admin inicial (placeholder de hash).
-- Autor       : Equipo ELYSEE
-- Fecha       : 2026-10-06
-- Idempotente : Si (verifica si ya existe el email)
-- Depende de  : 0001-0009
-- Nota        : El hash real se actualiza desde el backend con un script
--               de Node.js que usa bcrypt. Este script inserta un
--               placeholder para no romper la creacion del admin.
-- =====================================================================

USE ElyseeDB;
GO

SET NOCOUNT ON;
GO

-- Verificar prerequisito
IF OBJECT_ID('dbo.Usuarios', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Usuarios no existe. Ejecuta primero 0009_Create_Usuarios.sql';
    RETURN;
END

PRINT 'OK: Prerequisitos verificados.';
GO

-- ---------------------------------------------------------------------
-- Insertar admin (si no existe)
-- ---------------------------------------------------------------------
IF EXISTS (SELECT 1 FROM dbo.Usuarios WHERE Email = 'admin@elysee.com')
BEGIN
    PRINT 'Aviso: El admin ya existe. Omitiendo insercion.';
END
ELSE
BEGIN
    -- NOTA: Este hash es un PLACEHOLDER. La contraseña real es "Admin123!"
    -- pero el hash debe generarse con bcrypt en el backend.
    -- El script backend/scripts/update-admin-password.js lo actualizara.
    INSERT INTO dbo.Usuarios (Email, PasswordHash, Nombre, Rol)
    VALUES (
        'admin@elysee.com',
        'PLACEHOLDER_HASH_REEMPLAZAR_CON_SCRIPT_BACKEND',
        'Administrador ELYSEE',
        'admin'
    );

    PRINT 'OK: Usuario admin creado con placeholder.';
    PRINT 'IMPORTANTE: Ejecutar "npm run update:admin-password" en backend para activarlo.';
END
GO

-- ---------------------------------------------------------------------
-- Verificar
-- ---------------------------------------------------------------------
PRINT '';
PRINT '=== Usuarios en el sistema ===';
SELECT 
    UsuarioID,
    Email,
    Nombre,
    Rol,
    Activo,
    CASE 
        WHEN PasswordHash LIKE 'PLACEHOLDER%' THEN 'PENDIENTE (ejecutar update:admin-password)'
        ELSE 'ACTIVO'
    END AS Estado
FROM dbo.Usuarios;
GO

PRINT '';
PRINT '=====================================================================';
PRINT '  Migracion 0010 completada.';
PRINT '  Siguiente paso: actualizar el hash desde el backend.';
PRINT '=====================================================================';
GO