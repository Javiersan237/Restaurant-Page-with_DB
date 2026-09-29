-- =====================================================================
-- ELYSEE RESERVAS - Migracion 0007
-- =====================================================================
-- Descripcion : Inserta las 13 mesas del restaurante (50 personas total).
-- Autor       : Equipo ELYSEE
-- Fecha       : 2026-09-29
-- Idempotente : Si (solo inserta si la tabla esta vacia)
-- Depende de  : 0001-0006
-- =====================================================================

USE ElyseeDB;
GO

SET NOCOUNT ON;
GO

-- ---------------------------------------------------------------------
-- PASO 0: Verificar prerequisitos
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Mesas', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Mesas no existe. Ejecuta primero 0003_Create_Mesas.sql';
    RETURN;
END

PRINT 'OK: Prerequisitos verificados.';
GO

-- ---------------------------------------------------------------------
-- PASO 1: Verificar si ya hay datos (idempotencia)
-- ---------------------------------------------------------------------
DECLARE @TotalMesas INT;
SELECT @TotalMesas = COUNT(*) FROM dbo.Mesas;

IF @TotalMesas > 0
BEGIN
    PRINT 'Aviso: La tabla Mesas ya contiene ' + CAST(@TotalMesas AS NVARCHAR(10)) + ' registros.';
    PRINT 'Omitiendo insercion para evitar duplicados.';
    RETURN;
END

PRINT 'OK: La tabla Mesas esta vacia. Insertando 13 mesas (50 personas)...';
GO

-- ---------------------------------------------------------------------
-- PASO 2: Insertar las 13 mesas
-- ---------------------------------------------------------------------

-- Terraza (8 personas)
PRINT 'Insertando Terraza...';
INSERT INTO dbo.Mesas (NumeroMesa, Capacidad, Ubicacion, Estado) VALUES
    ('T1', 2, 'Terraza', 'Disponible'),
    ('T2', 2, 'Terraza', 'Disponible'),
    ('T3', 4, 'Terraza', 'Disponible');

-- Salon Principal (16 personas)
PRINT 'Insertando Salon Principal...';
INSERT INTO dbo.Mesas (NumeroMesa, Capacidad, Ubicacion, Estado) VALUES
    ('S1', 2, 'Salon Principal', 'Disponible'),
    ('S2', 4, 'Salon Principal', 'Disponible'),
    ('S3', 4, 'Salon Principal', 'Disponible'),
    ('S4', 6, 'Salon Principal', 'Disponible');

-- Salon Privado (18 personas)
PRINT 'Insertando Salon Privado...';
INSERT INTO dbo.Mesas (NumeroMesa, Capacidad, Ubicacion, Estado) VALUES
    ('P1', 8,  'Salon Privado', 'Disponible'),
    ('P2', 10, 'Salon Privado', 'Disponible');

-- Bar (8 personas)
PRINT 'Insertando Bar...';
INSERT INTO dbo.Mesas (NumeroMesa, Capacidad, Ubicacion, Estado) VALUES
    ('B1', 2, 'Bar', 'Disponible'),
    ('B2', 2, 'Bar', 'Disponible'),
    ('B3', 2, 'Bar', 'Disponible'),
    ('B4', 2, 'Bar', 'Disponible');

PRINT 'OK: 13 mesas insertadas.';
GO

-- ---------------------------------------------------------------------
-- PASO 3: Verificar totales
-- ---------------------------------------------------------------------
DECLARE @Total INT, @CapacidadTotal INT;
SELECT @Total = COUNT(*), @CapacidadTotal = SUM(Capacidad) FROM dbo.Mesas;

PRINT '';
PRINT '=== Resumen ===';
PRINT 'Total de mesas: ' + CAST(@Total AS NVARCHAR(10));
PRINT 'Capacidad total: ' + CAST(@CapacidadTotal AS NVARCHAR(10)) + ' personas';

IF @Total = 13 AND @CapacidadTotal = 50
    PRINT 'OK: Verificacion exitosa (13 mesas / 50 personas).';
ELSE
    PRINT 'ERROR: Se esperaban 13 mesas / 50 personas.';
GO

-- ---------------------------------------------------------------------
-- PASO 4: Mostrar distribucion por zona
-- ---------------------------------------------------------------------
PRINT '';
PRINT '=== Distribucion por zona ===';
SELECT 
    Ubicacion           AS Zona,
    COUNT(*)            AS Mesas,
    SUM(Capacidad)      AS Capacidad
FROM dbo.Mesas
GROUP BY Ubicacion
ORDER BY Ubicacion;
GO

-- ---------------------------------------------------------------------
-- PASO 5: Listar todas las mesas
-- ---------------------------------------------------------------------
PRINT '';
PRINT '=== Todas las mesas ===';
SELECT 
    MesaID          AS ID,
    NumeroMesa      AS Mesa,
    Capacidad       AS Cap,
    Ubicacion       AS Zona,
    Estado
FROM dbo.Mesas
ORDER BY 
    CASE Ubicacion
        WHEN 'Terraza' THEN 1
        WHEN 'Salon Principal' THEN 2
        WHEN 'Salon Privado' THEN 3
        WHEN 'Bar' THEN 4
        ELSE 5
    END,
    NumeroMesa;
GO

PRINT '';
PRINT '=====================================================================';
PRINT '  Datos iniciales insertados.';
PRINT '  Base de datos ElyseeDB completamente configurada.';
PRINT '=====================================================================';
GO