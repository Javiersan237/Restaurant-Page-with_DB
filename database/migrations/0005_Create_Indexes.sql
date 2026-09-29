-- =====================================================================
-- ELYSEE RESERVAS - Migracion 0005
-- =====================================================================
-- Descripcion : Crea indices para optimizar consultas frecuentes.
-- Autor       : Equipo ELYSEE
-- Fecha       : 2026-09-28
-- Idempotente : Si 
-- Depende de  : 0001-0004 (BD + las 3 tablas)
-- =====================================================================

USE ElyseeDB;
GO

SET NOCOUNT ON;
GO

-- Verificar prerequisitos

IF OBJECT_ID('dbo.Reservaciones', 'U') IS NULL
BEGIN
    PRINT 'ERROR: La tabla Reservaciones no existe. Ejecuta primero 0004_Create_Reservaciones.sql';
    RETURN;
END

PRINT 'OK: Prerequisitos verificados.';
GO

-- Eliminar indices si ya existen (idempotencia)

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reservaciones_Fecha_Hora' 
           AND object_id = OBJECT_ID('dbo.Reservaciones'))
BEGIN
    DROP INDEX IX_Reservaciones_Fecha_Hora ON dbo.Reservaciones;
    PRINT 'OK: Indice IX_Reservaciones_Fecha_Hora eliminado.';
END

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reservaciones_Mesa_Fecha' 
           AND object_id = OBJECT_ID('dbo.Reservaciones'))
BEGIN
    DROP INDEX IX_Reservaciones_Mesa_Fecha ON dbo.Reservaciones;
    PRINT 'OK: Indice IX_Reservaciones_Mesa_Fecha eliminado.';
END

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reservaciones_Cliente' 
           AND object_id = OBJECT_ID('dbo.Reservaciones'))
BEGIN
    DROP INDEX IX_Reservaciones_Cliente ON dbo.Reservaciones;
    PRINT 'OK: Indice IX_Reservaciones_Cliente eliminado.';
END

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reservaciones_Estado' 
           AND object_id = OBJECT_ID('dbo.Reservaciones'))
BEGIN
    DROP INDEX IX_Reservaciones_Estado ON dbo.Reservaciones;
    PRINT 'OK: Indice IX_Reservaciones_Estado eliminado.';
END

PRINT '';
PRINT 'Indices previos verificados.';
GO

-- Crear los indices

-- Indice 1: Consultas de disponibilidad por fecha y hora
-- Uso: WHERE Fecha = @Fecha AND Hora BETWEEN @Hora1 AND @Hora2
CREATE NONCLUSTERED INDEX IX_Reservaciones_Fecha_Hora
    ON dbo.Reservaciones(Fecha, Hora)
    INCLUDE (MesaID, Estado);
GO
PRINT 'OK: IX_Reservaciones_Fecha_Hora creado.';

-- Indice 2: Detectar doble reservacion (misma mesa, misma fecha)
-- Uso: WHERE MesaID = @MesaID AND Fecha = @Fecha
CREATE NONCLUSTERED INDEX IX_Reservaciones_Mesa_Fecha
    ON dbo.Reservaciones(MesaID, Fecha)
    INCLUDE (Hora, Estado);
GO
PRINT 'OK: IX_Reservaciones_Mesa_Fecha creado.';

-- Indice 3: Historial de reservaciones de un cliente
-- Uso: WHERE ClienteID = @ClienteID
CREATE NONCLUSTERED INDEX IX_Reservaciones_Cliente
    ON dbo.Reservaciones(ClienteID)
    INCLUDE (Fecha, Hora, MesaID, Estado);
GO
PRINT 'OK: IX_Reservaciones_Cliente creado.';

-- Indice 4: Filtrar reservaciones por estado
-- Uso: WHERE Estado = 'Pendiente' / 'Confirmada' / etc.
CREATE NONCLUSTERED INDEX IX_Reservaciones_Estado
    ON dbo.Reservaciones(Estado)
    INCLUDE (Fecha, Hora, MesaID, ClienteID);
GO
PRINT 'OK: IX_Reservaciones_Estado creado.';

PRINT '';
PRINT 'OK: Todos los indices creados con exito.';
GO

-- Verificar que los indices existen

PRINT '';
PRINT '=== Indices de la tabla Reservaciones ===';
SELECT 
    i.name              AS Indice,
    i.type_desc         AS Tipo,
    STUFF((
        SELECT ', ' + c.name
        FROM sys.index_columns ic
        INNER JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
        WHERE ic.object_id = i.object_id 
          AND ic.index_id = i.index_id 
          AND ic.is_included_column = 0
        ORDER BY ic.key_ordinal
        FOR XML PATH('')
    ), 1, 2, '')        AS ColumnasClave,
    STUFF((
        SELECT ', ' + c.name
        FROM sys.index_columns ic
        INNER JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
        WHERE ic.object_id = i.object_id 
          AND ic.index_id = i.index_id 
          AND ic.is_included_column = 1
        ORDER BY ic.index_column_id
        FOR XML PATH('')
    ), 1, 2, '')        AS ColumnasIncluidas
FROM sys.indexes i
WHERE i.object_id = OBJECT_ID('dbo.Reservaciones')
  AND i.type > 0  -- Excluir HEAP (type = 0)
ORDER BY i.name;
GO

-- Verificar tamano de los indices

PRINT '';
PRINT '=== Tamano de los indices ===';
SELECT 
    i.name                              AS Indice,
    SUM(ps.used_page_count) * 8         AS TamanoKB,
    SUM(ps.row_count)                   AS Filas
FROM sys.dm_db_partition_stats ps
INNER JOIN sys.indexes i ON i.object_id = ps.object_id AND i.index_id = ps.index_id
WHERE ps.object_id = OBJECT_ID('dbo.Reservaciones')
  AND i.type > 0
GROUP BY i.name
ORDER BY i.name;
GO

PRINT '';
PRINT '=====================================================================';
PRINT '  Indices creados.';
PRINT '  Siguiente paso: ejecutar 0006_Insert_DatosIniciales.sql';
PRINT '=====================================================================';
GO
