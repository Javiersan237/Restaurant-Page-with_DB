# 🔐 Guía de Autenticación — ÉLYSÉE Reservas

Documentación del sistema de autenticación con JWT.

## Arquitectura

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│ Cliente  │ ── POST /login ──► │ Backend  │ ── Verificar ────► │  BD      │
│ (React)  │                    │ (Express)│                    │ (SQLSrv) │
│          │ ◄── JWT ─────────  │          │                    │          │
└──────────┘                    └──────────┘                    └──────────┘
     │
     │ Guarda JWT en localStorage
     │
     ▼
┌──────────┐
│ Requests │ ── Authorization: Bearer <JWT> ──► Backend
│ futuros  │
└──────────┘
```

## Tablas involucradas

| Tabla | Propósito |
|-------|-----------|
| `Clientes` | Cuentas de clientes (con `PasswordHash`, `Activo`, `UltimoLogin`) |
| `Usuarios` | Cuentas de administradores y staff |

## Roles disponibles

| Rol | Origen | Acceso |
|-----|--------|--------|
| `cliente` | Tabla `Clientes` | Endpoints `/api/cliente/*` |
| `admin` | Tabla `Usuarios` | Todos los endpoints `/api/admin/*` |
| `staff` | Tabla `Usuarios` | Igual que admin (por ahora) |

## Flujo de registro

1. **Cliente** envía `POST /api/auth/registro` con datos personales.
2. **Backend** valida, hashea la contraseña con bcrypt (10 rounds).
3. **Backend** inserta al cliente en la tabla `Clientes`.
4. **Backend** genera un JWT con `{ userID, email, role: 'cliente' }`.
5. **Backend** devuelve `{ token, user }`.
6. **Frontend** guarda el token en `localStorage`.

## Flujo de login

1. **Cliente** envía `POST /api/auth/login` con email y contraseña.
2. **Backend** busca al cliente por email.
3. **Backend** compara la contraseña con `bcrypt.compare()`.
4. **Backend** actualiza `UltimoLogin`.
5. **Backend** genera un JWT con expiración de 24h.
6. **Backend** devuelve `{ token, user }`.
7. **Frontend** guarda el token en `localStorage`.

## Flujo de requests autenticados

1. **Frontend** recupera el token de `localStorage`.
2. **Interceptor de axios** lo añade al header:
   ```
   Authorization: Bearer <token>
   ```
3. **Backend** (`verificarToken`):
   - Extrae el token del header.
   - Verifica con `jwt.verify(token, JWT_SECRET)`.
   - Inyecta `req.user` con el payload.
4. **Middleware `requireRole(...)`** verifica que el rol tenga acceso.
5. **Handler** procesa el request con `req.user.userID`.

## Seguridad

### bcrypt

- **Rounds**: 10 (balance entre seguridad y performance).
- **Salt**: generado automáticamente por bcrypt.
- **Nunca** se guardan contraseñas en texto plano.
- **Nunca** se devuelve el hash en respuestas.

### JWT

- **Algoritmo**: HS256.
- **Secret**: en `.env` (`JWT_SECRET`).
- **Expiración**: 24 horas (`JWT_EXPIRES_IN`).
- **Payload**: `{ userID, email, role, iat, exp }`.

### Rate limiting

- Login: **5 intentos / 15 min** en producción.
- En desarrollo: 100 intentos / 15 min.

### Consideraciones de producción

- **HTTPS obligatorio** para evitar interceptación del token.
- **Rotar `JWT_SECRET`** periódicamente.
- **No guardar tokens** en `sessionStorage` si el riesgo de XSS es alto; preferir cookies `HttpOnly` (migración futura).

## Cambiar la contraseña del admin

El hash de bcrypt no se puede generar desde SQL. Se genera con un script de Node:

```cmd
cd backend
npm run update:admin-password
```

Esto lee `admin@elysee.com` y actualiza su `PasswordHash` con el valor de `Admin123!` hasheado.

**Credenciales del admin de prueba:**

- **Email**: `admin@elysee.com`
- **Password**: `Admin123!`

⚠️ **Cambiar en producción**.

## Cómo agregar un nuevo admin

```sql
INSERT INTO dbo.Usuarios (Email, PasswordHash, Nombre, Rol)
VALUES (
    'nuevo-admin@elysee.com',
    '$2b$10$...',  -- hash generado con bcrypt
    'Nuevo Admin',
    'admin'
);
```

O crear un script similar a `update-admin-password.js` para automatizar.

## Estructura del JWT (payload)

```json
{
  "userID": 45,
  "email": "sofia@example.com",
  "role": "cliente",
  "iat": 1728000000,
  "exp": 1728086400
}
```

| Campo | Descripción |
|-------|-------------|
| `userID` | ID del cliente (`ClienteID`) o admin (`UsuarioID`) |
| `email` | Email del usuario |
| `role` | `cliente`, `admin` o `staff` |
| `iat` | Timestamp de emisión |
| `exp` | Timestamp de expiración |

## Endpoints protegidos

| Endpoint | Rol requerido |
|----------|---------------|
| `GET /api/auth/me` | Cualquiera con JWT válido |
| `POST /api/reservaciones` | `cliente` |
| `GET /api/cliente/*` | `cliente` |
| `PATCH /api/cliente/*` | `cliente` |
| `GET /api/admin/*` | `admin` o `staff` |
| `PATCH /api/admin/*` | `admin` o `staff` |

## Manejo de errores

| Código | HTTP | Significado |
|--------|:----:|-------------|
| `UNAUTHORIZED` | 401 | No hay token |
| `INVALID_TOKEN` | 401 | Token malformado o firma inválida |
| `TOKEN_EXPIRED` | 401 | Token expirado (re-loguear) |
| `FORBIDDEN` | 403 | Token válido pero sin permisos |
| `INVALID_CREDENTIALS` | 401 | Login incorrecto |
| `EMAIL_ALREADY_EXISTS` | 409 | Registro duplicado |
| `TOO_MANY_LOGIN_ATTEMPTS` | 429 | Rate limit |