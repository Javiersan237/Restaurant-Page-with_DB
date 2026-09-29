-- =====================================================================
-- ELYSEE RESERVAS - Tests
-- =====================================================================
-- Descripcion : Pruebas de las queries reutilizables.
-- Autor       : Equipo ELYSEE
-- Fecha       : 2026-09-29
-- Uso         : Ejecutar con F5 en SSMS. Verifica que las queries
--               devuelven resultados coherentes.
-- =====================================================================

USE ElyseeDB;
GO

SET NOCOUNT ON;
GO

PRINT '';
PRINT '=====================================================================';
PRINT '  ELYSEE RESERVAS - Tests de Queries';
PRINT '=====================================================================';
PRINT '';

-- Tabla temporal para acumular resultados
CREATE TABLE #ResultadosQueries (
    TestID    INT IDENTITY(1,1),
    Nombre    NVARCHAR(200),
    Resultado NVARCHAR(20),
    Detalle   NVARCHAR(500)
);
GO

-- =====================================================================
-- TEST 1: Las 4 tablas existen
-- =====================================================================
DECLARE @Tablas INT;
SELECT @Tablas = COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
  AND TABLE_NAME IN ('Agendas', 'Clientes', 'Mesas', 'Reservaciones');

IF @Tablas = 4
    INSERT INTO #ResultadosQueries VALUES ('Las 4 tablas existen', 'OK', 'Encontradas 4 tablas');
ELSE
    INSERT INTO #ResultadosQueries VALUES ('Las 4 tablas existen', 'FALLO', 'Solo ' + CAST(@Tablas AS NVARCHAR(10)) + ' tablas');
GO

-- =====================================================================
-- TEST 2: Hay 13 mesas con 50 personas de capacidad total
-- =====================================================================
DECLARE @TotalMesas INT, @CapacidadTotal INT;
SELECT @TotalMesas = COUNT(*), @CapacidadTotal = SUM(Capacidad) FROM dbo.Mesas;

IF @TotalMesas = 13 AND @CapacidadTotal = 50
    INSERT INTO #ResultadosQueries VALUES ('13 mesas / 50 personas', 'OK', 'Conteo correcto');
ELSE
    INSERT INTO #ResultadosQueries VALUES ('13 mesas / 50 personas', 'FALLO', 
        CAST(@TotalMesas AS NVARCHAR(10)) + ' mesas / ' + CAST(@CapacidadTotal AS NVARCHAR(10)) + ' personas');
GO

-- =====================================================================
-- TEST 3: Reservaciones no tienen solapamiento en la misma mesa
-- =====================================================================
DECLARE @Solapamientos INT;
SELECT @Solapamientos = COUNT(*)
FROM dbo.Reservaciones r1
INNER JOIN dbo.Agendas a1 ON a1.AgendaID = r1.AgendaID
INNER JOIN dbo.Reservaciones r2 ON r1.MesaID = r2.MesaID AND r1.ReservacionID < r2.ReservacionID
INNER JOIN dbo.Agendas a2 ON a2.AgendaID = r2.AgendaID
WHERE a1.Fecha = a2.Fecha
  AND a1.HoraInicio < a2.HoraFin
  AND a1.HoraFin > a2.HoraInicio
  AND r1.Estado IN ('Pendiente', 'Confirmada')
  AND r2.Estado IN ('Pendiente', 'Confirmada');

IF @Solapamientos = 0
    INSERT INTO #ResultadosQueries VALUES ('Sin solapamiento de reservaciones', 'OK', 'Ningun solapamiento encontrado');
ELSE
    INSERT INTO #ResultadosQueries VALUES ('Sin solapamiento de reservaciones', 'FALLO', 
        CAST(@Solapamientos AS NVARCHAR(10)) + ' solapamientos detectados');
GO

-- =====================================================================
-- TEST 4: La query de disponibilidad funciona
-- =====================================================================
DECLARE @Disponibles INT;
SELECT @Disponibles = COUNT(*)
FROM dbo.Mesas m
WHERE m.Capacidad >= 4
  AND m.Estado = 'Disponible'
  AND m.MesaID NOT IN (
      SELECT r.MesaID FROM dbo.Reservaciones r
      INNER JOIN dbo.Agendas a ON a.AgendaID = r.AgendaID
      WHERE a.Fecha = '2030-01-01'
        AND a.HoraInicio < '23:00'
        AND a.HoraFin > '19:00'
        AND r.Estado IN ('Pendiente', 'Confirmada')
  );

IF @Disponibles > 0
    INSERT INTO #ResultadosQueries VALUES ('Query de disponibilidad funciona', 'OK', 
        CAST(@Disponibles AS NVARCHAR(10)) + ' mesas disponibles en fecha lejana');
ELSE
    INSERT INTO #ResultadosQueries VALUES ('Query de disponibilidad funciona', 'FALLO', 'Sin mesas');
GO

-- =====================================================================
-- TEST 5: Los indices existen
-- =====================================================================
DECLARE @Indices INT;
SELECT @Indices = COUNT(*) FROM sys.indexes
WHERE object_id = OBJECT_ID('dbo.Reservaciones')
  AND name IN (
    'IX_Reservaciones_Agenda',
    'IX_Reservaciones_Mesa_Agenda',
    'IX_Reservaciones_Cliente',
    'IX_Reservaciones_Estado'
  );

IF @Indices = 4
    INSERT INTO #ResultadosQueries VALUES ('Los 4 indices de Reservaciones existen', 'OK', 'Encontrados 4');
ELSE
    INSERT INTO #ResultadosQueries VALUES ('Los 4 indices de Reservaciones existen', 'FALLO', 
        'Solo ' + CAST(@Indices AS NVARCHAR(10)) + ' de 4');
GO

-- =====================================================================
-- TEST 6: Las 3 FKs de Reservaciones existen
-- =====================================================================
DECLARE @FKs INT;
SELECT @FKs = COUNT(*) FROM sys.foreign_keys
WHERE parent_object_id = OBJECT_ID('dbo.Reservaciones');

IF @FKs = 3
    INSERT INTO #ResultadosQueries VALUES ('Las 3 FKs de Reservaciones existen', 'OK', 'Encontradas 3');
ELSE
    INSERT INTO #ResultadosQueries VALUES ('Las 3 FKs de Reservaciones existen', 'FALLO', 
        'Solo ' + CAST(@FKs AS NVARCHAR(10)) + ' de 3');
GO

-- =====================================================================
-- RESUMEN
-- =====================================================================
PRINT '';
PRINT '=====================================================================';
PRINT '  RESULTADOS DE LOS TESTS DE QUERIES';
PRINT '=====================================================================';
PRINT '';

SELECT 
    TestID   AS [ID],
    Nombre   AS [Test],
    Resultado AS [Resultado],
    Detalle  AS [Detalle]
FROM #ResultadosQueries
ORDER BY TestID;

DECLARE @OK INT, @FALLO INT;
SELECT @OK = COUNT(*) FROM #ResultadosQueries WHERE Resultado = 'OK';
SELECT @FALLO = COUNT(*) FROM #ResultadosQueries WHERE Resultado = 'FALLO';

PRINT '';
PRINT '=====================================================================';
PRINT '  Tests OK:    ' + CAST(@OK AS NVARCHAR(10));
PRINT '  Tests FALLO: ' + CAST(@FALLO AS NVARCHAR(10));
PRINT '=====================================================================';

IF @FALLO = 0
    PRINT '  RESULTADO FINAL: TODOS LOS TESTS PASARON';
ELSE
    PRINT '  RESULTADO FINAL: HAY TESTS FALLIDOS';
GO

DROP TABLE #ResultadosQueries;
GO