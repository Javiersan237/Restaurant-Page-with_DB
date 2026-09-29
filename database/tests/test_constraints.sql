-- =====================================================================
-- ELYSEE RESERVAS - Tests
-- =====================================================================
-- Descripcion : Pruebas de constraints (CHECK, FK, UNIQUE).
-- Autor       : Equipo ELYSEE
-- Fecha       : 2026-09-29
-- Uso         : Ejecutar con F5 en SSMS. Los resultados se muestran al
--               final en una tabla de resumen.
-- Nota        : Usa TRANSACTIONS con ROLLBACK, no modifica datos reales.
-- =====================================================================

USE ElyseeDB;
GO

SET NOCOUNT ON;
GO

PRINT '';
PRINT '=====================================================================';
PRINT '  ELYSEE RESERVAS - Tests de Constraints';
PRINT '=====================================================================';
PRINT '';

-- Tabla temporal para acumular resultados
CREATE TABLE #Resultados (
    TestID    INT IDENTITY(1,1),
    Nombre    NVARCHAR(200),
    Resultado NVARCHAR(20),
    Mensaje   NVARCHAR(500)
);
GO

-- =====================================================================
-- TEST 1: CK_Clientes_Email - Rechazar email invalido
-- =====================================================================
BEGIN TRY
    BEGIN TRANSACTION;
        INSERT INTO dbo.Clientes (Nombre, Apellido, Email)
        VALUES ('Test', 'Email', 'no-es-un-email');

        -- Si llegamos aqui, el CHECK no funciono
        ROLLBACK;
        INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
        VALUES ('CK_Clientes_Email rechaza email invalido', 'FALLO', 'El CHECK no bloqueo el INSERT');
END TRY
BEGIN CATCH
    ROLLBACK;
    INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
    VALUES ('CK_Clientes_Email rechaza email invalido', 'OK', 'CHECK funciono correctamente');
END CATCH
GO

-- =====================================================================
-- TEST 2: CK_Clientes_Nombre - Rechazar nombre vacio
-- =====================================================================
BEGIN TRY
    BEGIN TRANSACTION;
        INSERT INTO dbo.Clientes (Nombre, Apellido, Email)
        VALUES ('', 'Test', 'test@example.com');

        ROLLBACK;
        INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
        VALUES ('CK_Clientes_Nombre rechaza nombre vacio', 'FALLO', 'El CHECK no bloqueo el INSERT');
END TRY
BEGIN CATCH
    ROLLBACK;
    INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
    VALUES ('CK_Clientes_Nombre rechaza nombre vacio', 'OK', 'CHECK funciono correctamente');
END CATCH
GO

-- =====================================================================
-- TEST 3: UQ_Clientes_Email - Rechazar email duplicado
-- =====================================================================
BEGIN TRY
    BEGIN TRANSACTION;
        -- Insertar el primero
        INSERT INTO dbo.Clientes (Nombre, Apellido, Email)
        VALUES ('Test1', 'Unique', 'unico@test.com');

        -- Intentar el duplicado
        INSERT INTO dbo.Clientes (Nombre, Apellido, Email)
        VALUES ('Test2', 'Unique', 'unico@test.com');

        ROLLBACK;
        INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
        VALUES ('UQ_Clientes_Email rechaza duplicado', 'FALLO', 'El UNIQUE no bloqueo');
END TRY
BEGIN CATCH
    ROLLBACK;
    INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
    VALUES ('UQ_Clientes_Email rechaza duplicado', 'OK', 'UNIQUE funciono correctamente');
END CATCH
GO

-- =====================================================================
-- TEST 4: CK_Mesas_Capacidad - Rechazar capacidad 0
-- =====================================================================
BEGIN TRY
    BEGIN TRANSACTION;
        INSERT INTO dbo.Mesas (NumeroMesa, Capacidad, Ubicacion)
        VALUES ('TX', 0, 'Terraza');

        ROLLBACK;
        INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
        VALUES ('CK_Mesas_Capacidad rechaza 0', 'FALLO', 'El CHECK no bloqueo');
END TRY
BEGIN CATCH
    ROLLBACK;
    INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
    VALUES ('CK_Mesas_Capacidad rechaza 0', 'OK', 'CHECK funciono correctamente');
END CATCH
GO

-- =====================================================================
-- TEST 5: CK_Mesas_Capacidad - Rechazar capacidad 25
-- =====================================================================
BEGIN TRY
    BEGIN TRANSACTION;
        INSERT INTO dbo.Mesas (NumeroMesa, Capacidad, Ubicacion)
        VALUES ('TX', 25, 'Terraza');

        ROLLBACK;
        INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
        VALUES ('CK_Mesas_Capacidad rechaza 25', 'FALLO', 'El CHECK no bloqueo');
END TRY
BEGIN CATCH
    ROLLBACK;
    INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
    VALUES ('CK_Mesas_Capacidad rechaza 25', 'OK', 'CHECK funciono correctamente');
END CATCH
GO

-- =====================================================================
-- TEST 6: CK_Mesas_Estado - Rechazar estado invalido
-- =====================================================================
BEGIN TRY
    BEGIN TRANSACTION;
        INSERT INTO dbo.Mesas (NumeroMesa, Capacidad, Ubicacion, Estado)
        VALUES ('TX', 4, 'Terraza', 'Rota');

        ROLLBACK;
        INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
        VALUES ('CK_Mesas_Estado rechaza estado invalido', 'FALLO', 'El CHECK no bloqueo');
END TRY
BEGIN CATCH
    ROLLBACK;
    INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
    VALUES ('CK_Mesas_Estado rechaza estado invalido', 'OK', 'CHECK funciono correctamente');
END CATCH
GO

-- =====================================================================
-- TEST 7: CK_Agendas_Duracion - Rechazar duracion 15 min
-- =====================================================================
BEGIN TRY
    BEGIN TRANSACTION;
        INSERT INTO dbo.Agendas (Fecha, HoraInicio, HoraFin, DuracionMin)
        VALUES ('2026-12-01', '19:00', '19:15', 15);

        ROLLBACK;
        INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
        VALUES ('CK_Agendas_Duracion rechaza 15 min', 'FALLO', 'El CHECK no bloqueo');
END TRY
BEGIN CATCH
    ROLLBACK;
    INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
    VALUES ('CK_Agendas_Duracion rechaza 15 min', 'OK', 'CHECK funciono correctamente');
END CATCH
GO

-- =====================================================================
-- TEST 8: CK_Agendas_Duracion - Rechazar duracion 200 min
-- =====================================================================
BEGIN TRY
    BEGIN TRANSACTION;
        INSERT INTO dbo.Agendas (Fecha, HoraInicio, HoraFin, DuracionMin)
        VALUES ('2026-12-01', '19:00', '22:20', 200);

        ROLLBACK;
        INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
        VALUES ('CK_Agendas_Duracion rechaza 200 min', 'FALLO', 'El CHECK no bloqueo');
END TRY
BEGIN CATCH
    ROLLBACK;
    INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
    VALUES ('CK_Agendas_Duracion rechaza 200 min', 'OK', 'CHECK funciono correctamente');
END CATCH
GO

-- =====================================================================
-- TEST 9: CK_Reservaciones_Personas - Rechazar personas 0
-- =====================================================================
BEGIN TRY
    BEGIN TRANSACTION;
        -- Necesitamos cliente, mesa y agenda validos
        DECLARE @ClienteID INT, @MesaID INT, @AgendaID INT;

        SELECT TOP 1 @ClienteID = ClienteID FROM dbo.Clientes;
        SELECT TOP 1 @MesaID = MesaID FROM dbo.Mesas;

        INSERT INTO dbo.Agendas (Fecha, HoraInicio, HoraFin, DuracionMin)
        VALUES ('2027-01-01', '20:00', '21:00', 60);
        SET @AgendaID = SCOPE_IDENTITY();

        INSERT INTO dbo.Reservaciones (ClienteID, MesaID, AgendaID, NumeroPersonas)
        VALUES (@ClienteID, @MesaID, @AgendaID, 0);

        ROLLBACK;
        INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
        VALUES ('CK_Reservaciones_Personas rechaza 0', 'FALLO', 'El CHECK no bloqueo');
END TRY
BEGIN CATCH
    ROLLBACK;
    INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
    VALUES ('CK_Reservaciones_Personas rechaza 0', 'OK', 'CHECK funciono correctamente');
END CATCH
GO

-- =====================================================================
-- TEST 10: FK_Reservaciones_Clientes - Rechazar cliente inexistente
-- =====================================================================
BEGIN TRY
    BEGIN TRANSACTION;
        DECLARE @MesaID2 INT, @AgendaID2 INT;

        SELECT TOP 1 @MesaID2 = MesaID FROM dbo.Mesas;

        INSERT INTO dbo.Agendas (Fecha, HoraInicio, HoraFin, DuracionMin)
        VALUES ('2027-01-02', '20:00', '21:00', 60);
        SET @AgendaID2 = SCOPE_IDENTITY();

        INSERT INTO dbo.Reservaciones (ClienteID, MesaID, AgendaID, NumeroPersonas)
        VALUES (99999, @MesaID2, @AgendaID2, 4);

        ROLLBACK;
        INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
        VALUES ('FK_Reservaciones_Clientes rechaza cliente inexistente', 'FALLO', 'La FK no bloqueo');
END TRY
BEGIN CATCH
    ROLLBACK;
    INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
    VALUES ('FK_Reservaciones_Clientes rechaza cliente inexistente', 'OK', 'FK funciono correctamente');
END CATCH
GO

-- =====================================================================
-- TEST 11: FK_Reservaciones_Mesas - Rechazar mesa inexistente
-- =====================================================================
BEGIN TRY
    BEGIN TRANSACTION;
        DECLARE @ClienteID2 INT, @AgendaID3 INT;

        SELECT TOP 1 @ClienteID2 = ClienteID FROM dbo.Clientes;

        INSERT INTO dbo.Agendas (Fecha, HoraInicio, HoraFin, DuracionMin)
        VALUES ('2027-01-03', '20:00', '21:00', 60);
        SET @AgendaID3 = SCOPE_IDENTITY();

        INSERT INTO dbo.Reservaciones (ClienteID, MesaID, AgendaID, NumeroPersonas)
        VALUES (@ClienteID2, 99999, @AgendaID3, 4);

        ROLLBACK;
        INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
        VALUES ('FK_Reservaciones_Mesas rechaza mesa inexistente', 'FALLO', 'La FK no bloqueo');
END TRY
BEGIN CATCH
    ROLLBACK;
    INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
    VALUES ('FK_Reservaciones_Mesas rechaza mesa inexistente', 'OK', 'FK funciono correctamente');
END CATCH
GO

-- =====================================================================
-- TEST 12: FK_Reservaciones_Agendas - Rechazar agenda inexistente
-- =====================================================================
BEGIN TRY
    BEGIN TRANSACTION;
        DECLARE @ClienteID3 INT, @MesaID3 INT;

        SELECT TOP 1 @ClienteID3 = ClienteID FROM dbo.Clientes;
        SELECT TOP 1 @MesaID3 = MesaID FROM dbo.Mesas;

        INSERT INTO dbo.Reservaciones (ClienteID, MesaID, AgendaID, NumeroPersonas)
        VALUES (@ClienteID3, @MesaID3, 99999, 4);

        ROLLBACK;
        INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
        VALUES ('FK_Reservaciones_Agendas rechaza agenda inexistente', 'FALLO', 'La FK no bloqueo');
END TRY
BEGIN CATCH
    ROLLBACK;
    INSERT INTO #Resultados (Nombre, Resultado, Mensaje)
    VALUES ('FK_Reservaciones_Agendas rechaza agenda inexistente', 'OK', 'FK funciono correctamente');
END CATCH
GO

-- =====================================================================
-- RESUMEN FINAL
-- =====================================================================
PRINT '';
PRINT '=====================================================================';
PRINT '  RESULTADOS DE LOS TESTS';
PRINT '=====================================================================';
PRINT '';

SELECT 
    TestID    AS [ID],
    Nombre    AS [Test],
    Resultado AS [Resultado],
    Mensaje   AS [Detalle]
FROM #Resultados
ORDER BY TestID;

-- Contar OK y FALLO
DECLARE @TotalOK INT, @TotalFallo INT, @Total INT;
SELECT @TotalOK = COUNT(*) FROM #Resultados WHERE Resultado = 'OK';
SELECT @TotalFallo = COUNT(*) FROM #Resultados WHERE Resultado = 'FALLO';
SELECT @Total = COUNT(*) FROM #Resultados;

PRINT '';
PRINT '=====================================================================';
PRINT '  Total de tests ejecutados: ' + CAST(@Total AS NVARCHAR(10));
PRINT '  Tests OK:   ' + CAST(@TotalOK AS NVARCHAR(10));
PRINT '  Tests FALLO: ' + CAST(@TotalFallo AS NVARCHAR(10));
PRINT '=====================================================================';

IF @TotalFallo = 0
    PRINT '  RESULTADO FINAL: TODOS LOS TESTS PASARON';
ELSE
    PRINT '  RESULTADO FINAL: HAY TESTS FALLIDOS - REVISAR CONSTRAINTS';
GO

-- Limpiar tabla temporal
DROP TABLE #Resultados;
GO