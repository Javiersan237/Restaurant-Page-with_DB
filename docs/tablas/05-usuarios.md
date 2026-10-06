# 📋 Tabla: Usuarios

## Descripción

Almacena las cuentas de **administradores y personal** del restaurante.
Los clientes viven en la tabla `Clientes`; esta tabla es solo para el
personal autorizado que puede acceder al panel de administración.

Los usuarios se distinguen por su `Rol`:

- **`admin`**: acceso completo al panel (lectura y escritura).
- **`staff`**: acceso de solo lectura al panel.

## Estructura

| Columna | Tipo | Nulo | Default | Descripción |
|---------|------|:----:|---------|-------------|
| `UsuarioID` | `INT IDENTITY(1,1)` | ❌ | auto | Identificador único |
| `Email` | `NVARCHAR(150)` | ❌ | — | Email único del usuario |
| `PasswordHash` | `NVARCHAR(255)` | ❌ | — | Hash bcrypt de la contraseña |
| `Nombre` | `NVARCHAR(100)` | ❌ | — | Nombre completo del usuario |
| `Rol` | `NVARCHAR(20)` | ❌ | `'admin'` | Rol del usuario (`admin` o `staff`) |
| `Activo` | `BIT` | ❌ | `1` | Cuenta activa (1) o desactivada (0) |
| `UltimoLogin` | `DATETIME` | ✅ | `NULL` | Último inicio de sesión |
| `FechaCreacion` | `DATETIME` | ❌ | `GETDATE()` | Fecha de creación de la cuenta |

## Valores permitidos

**Rol** (restringidos por CHECK):

- `admin` — Acceso completo al panel de administración
- `staff` — Acceso de solo lectura al panel

## Restricciones

| Nombre | Tipo | Columnas | Definición |
|--------|------|----------|------------|
| `PK_Usuarios` | Primary Key | `UsuarioID` | Identificador único |
| `UQ_Usuarios_Email` | Unique | `Email` | No se permiten emails duplicados |
| `CK_Usuarios_Rol` | Check | `Rol` | Solo `admin` o `staff` |
| `DF_Usuarios_Rol` | Default | `Rol` | Default `'admin'` |
| `DF_Usuarios_Activo` | Default | `Activo` | Default `1` |
| `DF_Usuarios_FechaCreacion` | Default | `FechaCreacion` | Default `GETDATE()` |

## Índices

| Nombre | Columnas | Propósito |
|--------|----------|-----------|
| `IX_Usuarios_Email` | `(Email)` | Búsquedas por email (login) |

## Script de creación

```sql
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

CREATE NONCLUSTERED INDEX IX_Usuarios_Email
    ON dbo.Usuarios(Email)
    INCLUDE (UsuarioID, Nombre, Rol, Activo);
GO
```

## Ejemplo de datos

| UsuarioID | Email | Nombre | Rol | Activo |
|:---------:|-------|--------|:---:|:------:|
| 1 | admin@elysee.com | Administrador ELYSEE | admin | 1 |
| 2 | staff@elysee.com | María Recepcionista | staff | 1 |

**Nota**: el `PasswordHash` NO se muestra por seguridad. El hash del admin
se genera con el script `npm run update:admin-password` del backend.

## Consultas frecuentes

**Buscar usuario por email** (para login de admin):

```sql
SELECT 
    UsuarioID,
    Email,
    PasswordHash,
    Nombre,
    Rol,
    Activo
FROM dbo.Usuarios
WHERE Email = @Email;
```

**Actualizar último login:**

```sql
UPDATE dbo.Usuarios
SET UltimoLogin = GETDATE()
WHERE UsuarioID = @UsuarioID;
```

**Listar admins activos:**

```sql
SELECT UsuarioID, Email, Nombre, Rol, UltimoLogin
FROM dbo.Usuarios
WHERE Activo = 1
ORDER BY Nombre;
```

## Notas de diseño

- **Tabla separada** de `Clientes` para separar responsabilidades. Los
  clientes y los admins tienen diferentes campos, flujos y niveles de
  acceso.
- **`PasswordHash`** contiene un hash bcrypt con 10 rounds. **NUNCA** se
  devuelve en respuestas de API.
- **`Rol`** distingue entre `admin` (control total) y `staff` (solo lectura).
- **`Activo`** permite deshabilitar cuentas sin borrarlas físicamente.
- **`UltimoLogin`** se actualiza automáticamente cuando el usuario inicia sesión.

## Cómo crear un nuevo admin

El hash de bcrypt **no se puede generar desde SQL**. Para crear un nuevo admin:

### Opción A — Script dedicado (recomendado)

Crear un script de Node.js similar a `update-admin-password.js`:

```javascript
const bcrypt = require('bcrypt');
const { getPool } = require('./src/config/database');

async function createAdmin(email, password, nombre, rol = 'admin') {
  const hash = await bcrypt.hash(password, 10);
  const pool = await getPool();
  
  await pool.request()
    .input('Email', email)
    .input('PasswordHash', hash)
    .input('Nombre', nombre)
    .input('Rol', rol)
    .query(`
      INSERT INTO dbo.Usuarios (Email, PasswordHash, Nombre, Rol)
      VALUES (@Email, @PasswordHash, @Nombre, @Rol)
    `);
  
  console.log('Admin creado:', email);
  process.exit(0);
}

createAdmin('nuevo@elysee.com', 'Password123!', 'Nuevo Admin');
```

### Opción B — Insertar manualmente con hash pre-generado

Generar el hash en cualquier script de Node.js y luego insertarlo manualmente:

```sql
INSERT INTO dbo.Usuarios (Email, PasswordHash, Nombre, Rol)
VALUES (
    'nuevo@elysee.com',
    '$2b$10$...',  -- hash bcrypt pre-generado
    'Nuevo Admin',
    'admin'
);
```