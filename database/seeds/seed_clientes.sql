-- =====================================================================
-- ELYSEE RESERVAS - Seeds
-- =====================================================================
-- Descripcion : Inserta 20 clientes de prueba (5 VIP).
-- Autor       : Equipo ELYSEE
-- Fecha       : 2026-09-29
-- Idempotente : Si (solo inserta si la tabla esta vacia)
-- Depende de  : 0001-0007 (migraciones)
-- =====================================================================

USE ElyseeDB;
GO

SET NOCOUNT ON;
GO

-- Verificar prerequisito
IF OBJECT_ID('dbo.Clientes', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Clientes no existe. Ejecuta las migraciones primero.';
    RETURN;
END

-- Verificar si ya hay clientes (idempotencia estricta)
DECLARE @TotalClientes INT;
SELECT @TotalClientes = COUNT(*) FROM dbo.Clientes;

IF @TotalClientes > 0
BEGIN
    PRINT 'Aviso: La tabla Clientes ya contiene ' + CAST(@TotalClientes AS NVARCHAR(10)) + ' registros.';
    PRINT 'Omitiendo insercion de seeds.';
END
ELSE
BEGIN
    PRINT 'OK: Insertando 20 clientes de prueba (5 VIP)...';

    -- Clientes VIP
    INSERT INTO dbo.Clientes (Nombre, Apellido, Email, Telefono, Preferencias, EsVIP) VALUES
        ('Alejandro', 'Rivas',     'alejandro.rivas@example.com',  '+52 555 987 6543', 'Mesa con vista al jardin, vino tinto',           1),
        ('Valentina', 'Herrera',   'valentina.h@example.com',      '+52 555 456 7890', 'Alergia a mariscos, preferencia terraza',        1),
        ('Ricardo',   'Mendoza',   'ricardo.mendoza@example.com',  '+52 555 321 0987', 'Amante del champagne, mesa privada',             1),
        ('Isabella',  'Fuentes',   'isabella.f@example.com',       '+52 555 654 3210', 'Vegetariana estricta, sin gluten',               1),
        ('Sebastian', 'Cortes',    'sebastian.cortes@example.com', '+52 555 789 0123', 'Celebraciones frecuentes, mesa junto a ventana', 1);

    -- Clientes regulares
    INSERT INTO dbo.Clientes (Nombre, Apellido, Email, Telefono, Preferencias, EsVIP) VALUES
        ('Sofia',     'Marquez',   'sofia.marquez@example.com',    '+52 555 123 4567', 'Aniversario en octubre',         0),
        ('Camila',    'Ortega',    'camila.ortega@example.com',    '+52 555 246 8135', NULL,                             0),
        ('Mateo',     'Gutierrez', 'mateo.g@example.com',          '+52 555 135 7924', 'Prefiere el bar',                0),
        ('Lucia',     'Navarro',   'lucia.navarro@example.com',    '+52 555 864 2097', 'Alergia a frutos secos',         0),
        ('Diego',     'Salazar',   'diego.salazar@example.com',    '+52 555 975 3108', NULL,                             0),
        ('Renata',    'Castro',    'renata.castro@example.com',    '+52 555 086 4219', 'Cumpleanos en diciembre',        0),
        ('Emiliano',  'Vargas',    'emiliano.v@example.com',       '+52 555 197 5320', 'Reuniones de negocios',          0),
        ('Ximena',    'Delgado',   'ximena.delgado@example.com',   '+52 555 208 6431', NULL,                             0),
        ('Fernanda',  'Rojas',     'fernanda.rojas@example.com',   '+52 555 319 7542', 'Prefiere mesa silenciosa',       0),
        ('Andres',    'Pena',      'andres.pena@example.com',      '+52 555 420 8653', 'Cliente frecuente los viernes',  0),
        ('Regina',    'Silva',     'regina.silva@example.com',     '+52 555 531 9764', NULL,                             0),
        ('Bruno',     'Aguilar',   'bruno.aguilar@example.com',    '+52 555 642 0875', 'Prefiere terraza al atardecer',  0),
        ('Antonella', 'Medina',    'antonella.m@example.com',      '+52 555 753 1986', 'Alergia al gluten',              0),
        ('Rodrigo',   'Cardenas',  'rodrigo.c@example.com',        '+52 555 864 2097', NULL,                             0),
        ('Julieta',   'Ibarra',    'julieta.ibarra@example.com',   '+52 555 975 3108', 'Cenas romanticas',               0);

    PRINT 'OK: 20 clientes insertados.';
END
GO

-- ---------------------------------------------------------------------
-- Verificar
-- ---------------------------------------------------------------------
DECLARE @Insertados INT;
SELECT @Insertados = COUNT(*) FROM dbo.Clientes;

PRINT '';
PRINT '=== Resumen ===';
PRINT 'Total de clientes: ' + CAST(@Insertados AS NVARCHAR(10));

SELECT 
    EsVIP,
    COUNT(*) AS Total
FROM dbo.Clientes
GROUP BY EsVIP;
GO
