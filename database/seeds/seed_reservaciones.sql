-- =====================================================================
-- ELYSEE RESERVAS - Seeds
-- =====================================================================
-- Descripcion : Inserta 40 reservaciones de prueba variadas.
-- Autor       : Equipo ELYSEE
-- Fecha       : 2026-09-29
-- Idempotente : Si (solo inserta si la tabla esta vacia)
-- Depende de  : 0001-0007 + seed_clientes.sql
-- =====================================================================

USE ElyseeDB;
GO

SET NOCOUNT ON;
GO

-- Verificar prerequisitos
IF OBJECT_ID('dbo.Reservaciones', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Reservaciones no existe. Ejecuta las migraciones primero.';
    RETURN;
END

IF (SELECT COUNT(*) FROM dbo.Clientes) = 0
BEGIN
    PRINT 'ERROR: No hay clientes. Ejecuta primero seed_clientes.sql.';
    RETURN;
END

IF (SELECT COUNT(*) FROM dbo.Reservaciones) > 0
BEGIN
    PRINT 'Aviso: Ya existen reservaciones. Omitiendo seeds.';
    RETURN;
END

PRINT 'OK: Insertando 40 reservaciones de prueba...';

-- =====================================================================
-- Variables del loop
-- =====================================================================
DECLARE @i INT = 1;
DECLARE @TotalReservaciones INT = 40;

DECLARE @ClienteID INT;
DECLARE @MesaID INT;
DECLARE @AgendaID INT;
DECLARE @Fecha DATE;
DECLARE @HoraInicio TIME(0);
DECLARE @HoraFin TIME(0);
DECLARE @DuracionMin INT;
DECLARE @Personas INT;
DECLARE @Estado NVARCHAR(20);
DECLARE @Notas NVARCHAR(300);

-- Rango real de IDs (por si el IDENTITY no empieza en 1)
DECLARE @ClienteMinID INT, @ClienteMaxID INT, @ClientesCount INT;
SELECT 
    @ClienteMinID = MIN(ClienteID),
    @ClienteMaxID = MAX(ClienteID),
    @ClientesCount = COUNT(*)
FROM dbo.Clientes;

DECLARE @MesaMinID INT, @MesaMaxID INT, @MesasCount INT;
SELECT 
    @MesaMinID = MIN(MesaID),
    @MesaMaxID = MAX(MesaID),
    @MesasCount = COUNT(*)
FROM dbo.Mesas;

PRINT 'Clientes: IDs de ' + CAST(@ClienteMinID AS NVARCHAR(10)) + ' a ' + CAST(@ClienteMaxID AS NVARCHAR(10));
PRINT 'Mesas: IDs de ' + CAST(@MesaMinID AS NVARCHAR(10)) + ' a ' + CAST(@MesaMaxID AS NVARCHAR(10));

WHILE @i <= @TotalReservaciones
BEGIN
    -- Cliente aleatorio usando el rango real
    SET @ClienteID = @ClienteMinID + ((@i * 7) % @ClientesCount);

    -- Mesa aleatoria usando el rango real
    SET @MesaID = @MesaMinID + ((@i * 11) % @MesasCount);

    SET @Fecha = DATEADD(DAY, (@i % 30) + 1, CAST(GETDATE() AS DATE));

    DECLARE @HoraBase INT = 13 + (@i % 9);

    SET @DuracionMin = CASE (@i % 5)
        WHEN 0 THEN 60
        WHEN 1 THEN 90
        WHEN 2 THEN 120
        WHEN 3 THEN 150
        ELSE 180
    END;

    DECLARE @HoraInicioStr NVARCHAR(8) = RIGHT('0' + CAST(@HoraBase AS NVARCHAR(2)), 2) + ':00:00';
    DECLARE @HoraFinTotalMin INT = (@HoraBase * 60) + @DuracionMin;
    DECLARE @HoraFinStr NVARCHAR(8) = 
        RIGHT('0' + CAST(@HoraFinTotalMin / 60 AS NVARCHAR(2)), 2) + ':' +
        RIGHT('0' + CAST(@HoraFinTotalMin % 60 AS NVARCHAR(2)), 2) + ':00';

    SET @HoraInicio = CAST(@HoraInicioStr AS TIME(0));
    SET @HoraFin = CAST(@HoraFinStr AS TIME(0));

    SET @Personas = CASE (@i % 3)
        WHEN 0 THEN 2
        WHEN 1 THEN 4
        ELSE 6
    END;

    SET @Estado = CASE (@i % 5)
        WHEN 0 THEN 'Pendiente'
        WHEN 1 THEN 'Confirmada'
        WHEN 2 THEN 'Confirmada'
        WHEN 3 THEN 'Completada'
        ELSE 'Pendiente'
    END;

    SET @Notas = CASE (@i % 7)
        WHEN 0 THEN 'Cumpleanos'
        WHEN 1 THEN 'Aniversario'
        WHEN 2 THEN 'Reunion de negocios'
        ELSE NULL
    END;

    SET @AgendaID = NULL;
    SELECT @AgendaID = AgendaID FROM dbo.Agendas
    WHERE Fecha = @Fecha AND HoraInicio = @HoraInicio AND HoraFin = @HoraFin;

    IF @AgendaID IS NULL
    BEGIN
        INSERT INTO dbo.Agendas (Fecha, HoraInicio, HoraFin, DuracionMin)
        VALUES (@Fecha, @HoraInicio, @HoraFin, @DuracionMin);

        SET @AgendaID = SCOPE_IDENTITY();
    END

    IF NOT EXISTS (
        SELECT 1 FROM dbo.Reservaciones r
        INNER JOIN dbo.Agendas a ON a.AgendaID = r.AgendaID
        WHERE r.MesaID = @MesaID
          AND a.Fecha = @Fecha
          AND a.HoraInicio < @HoraFin
          AND a.HoraFin > @HoraInicio
          AND r.Estado IN ('Pendiente', 'Confirmada')
    )
    BEGIN
        INSERT INTO dbo.Reservaciones (ClienteID, MesaID, AgendaID, NumeroPersonas, Estado, Notas)
        VALUES (@ClienteID, @MesaID, @AgendaID, @Personas, @Estado, @Notas);
    END

    SET @i = @i + 1;
END

PRINT 'OK: Reservaciones creadas.';
GO

-- ---------------------------------------------------------------------
-- Verificar
-- ---------------------------------------------------------------------
DECLARE @TotalRes INT, @TotalAgendas INT;
SELECT @TotalRes = COUNT(*) FROM dbo.Reservaciones;
SELECT @TotalAgendas = COUNT(*) FROM dbo.Agendas;

PRINT '';
PRINT '=== Resumen ===';
PRINT 'Total de reservaciones: ' + CAST(@TotalRes AS NVARCHAR(10));
PRINT 'Total de agendas: ' + CAST(@TotalAgendas AS NVARCHAR(10));

SELECT 
    Estado,
    COUNT(*) AS Total
FROM dbo.Reservaciones
GROUP BY Estado
ORDER BY Total DESC;

PRINT '';
PRINT '=== Reservaciones por fecha (top 10) ===';
SELECT TOP 10
    a.Fecha,
    COUNT(*) AS Total
FROM dbo.Reservaciones r
INNER JOIN dbo.Agendas a ON a.AgendaID = r.AgendaID
GROUP BY a.Fecha
ORDER BY a.Fecha;
GO