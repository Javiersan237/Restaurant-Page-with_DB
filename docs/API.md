# 🔌 Especificación de la API REST

Documentación de los endpoints REST del sistema de reservas **ÉLYSÉE**.

**Base URL desarrollo**: `http://localhost:3000/api`
**Base URL producción**: `https://api.elysee-reservas.com/api` *(a definir)*
**Versión actual**: `v1`
**Formato**: JSON UTF-8

## Índice

- [Convenciones](#convenciones)
- [Códigos de estado](#códigos-de-estado)
- [Formato de errores](#formato-de-errores)
- [Autenticación](#autenticación)
- [Endpoints de Autenticación](#endpoints-de-autenticación)
- [Endpoints de Cliente](#endpoints-de-cliente)
- [Endpoints de Administrador](#endpoints-de-administrador)
- [Endpoints públicos](#endpoints-públicos)
  - [Mesas](#endpoints-de-mesas)
  - [Reservaciones](#endpoints-de-reservaciones)
- [Notas para el frontend](#notas-para-el-frontend)
- [Notas para el backend](#notas-para-el-backend)
- [Versionado](#versionado)

---

## Convenciones

### Estructura de URLs

```text
/api/<recurso>              → colección
/api/<recurso>/:id          → item específico
/api/<recurso>/:id/<acción> → acción sobre un item
```

### Formato de request

- **Content-Type**: `application/json`
- **Accept**: `application/json`
- **Fechas**: ISO 8601 (`YYYY-MM-DD` para fechas, `HH:MM` para horas)
- **Strings**: UTF-8
- **Autorización**: header `Authorization: Bearer <token>` para endpoints protegidos

### Formato de response exitosa

**Objeto único:**

```json
{
  "data": {
    "id": 1,
    "nombre": "Sofía"
  }
}
```

**Lista:**

```json
{
  "data": [
    { "id": 1, "nombre": "Sofía" },
    { "id": 2, "nombre": "Alejandro" }
  ],
  "meta": {
    "total": 2
  }
}
```

### Formato de response de error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El campo email es obligatorio",
    "details": [
      {
        "field": "email",
        "message": "Requerido"
      }
    ]
  }
}
```

---

## Códigos de estado

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| `200 OK` | Éxito | GET, PATCH exitosos |
| `201 Created` | Recurso creado | POST exitoso |
| `400 Bad Request` | Error de validación | Faltan campos, formato inválido |
| `401 Unauthorized` | Sin autenticación | Token faltante, inválido o expirado |
| `403 Forbidden` | Sin permisos | Token válido pero sin rol suficiente |
| `404 Not Found` | Recurso no encontrado | ID no existe |
| `409 Conflict` | Conflicto de negocio | Email duplicado, mesa ya reservada |
| `422 Unprocessable Entity` | Semánticamente inválido | Fecha en el pasado, capacidad excedida |
| `429 Too Many Requests` | Rate limit excedido | Demasiados intentos de login |
| `500 Internal Server Error` | Error del servidor | Bug, fallo de BD |

---

## Formato de errores

Cada error incluye un `code` (identificador estable) y un `message` legible.

| Código | HTTP | Descripción |
|--------|------|-------------|
| `VALIDATION_ERROR` | 400 | Campos inválidos o faltantes |
| `UNAUTHORIZED` | 401 | No hay token |
| `INVALID_TOKEN` | 401 | Token malformado o firma inválida |
| `TOKEN_EXPIRED` | 401 | Token expirado (re-loguear) |
| `INVALID_CREDENTIALS` | 401 | Email o contraseña incorrectos |
| `ACCOUNT_DISABLED` | 403 | Cuenta desactivada |
| `FORBIDDEN` | 403 | Token válido pero sin permisos |
| `NOT_FOUND` | 404 | Recurso no existe |
| `EMAIL_ALREADY_EXISTS` | 409 | Email ya registrado |
| `TABLE_ALREADY_RESERVED` | 409 | Mesa ya reservada en ese horario |
| `RESTAURANT_FULL` | 409 | Capacidad global excedida |
| `DATE_IN_PAST` | 422 | No se puede reservar en el pasado |
| `CAPACITY_EXCEEDED` | 422 | Personas > capacidad de mesa |
| `INVALID_DURATION` | 422 | Duración fuera de rango |
| `INVALID_STATE_TRANSITION` | 422 | Cambio de estado no permitido |
| `TOO_MANY_LOGIN_ATTEMPTS` | 429 | Demasiados intentos de login |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |

---

## Autenticación

Todos los endpoints protegidos usan **JWT** con algoritmo HS256 y expiración de 24 horas.

### Formato del header

```text
Authorization: Bearer <token>
```

### Payload del JWT

```json
{
  "userID": 45,
  "email": "sofia@example.com",
  "role": "cliente",
  "iat": 1728000000,
  "exp": 1728086400
}
```

### Roles

| Rol | Origen | Acceso |
|-----|--------|--------|
| `cliente` | Tabla `Clientes` | Endpoints `/api/cliente/*` y `POST /api/reservaciones` |
| `admin` | Tabla `Usuarios` | Todos los endpoints `/api/admin/*` |
| `staff` | Tabla `Usuarios` | Igual que admin |

---

## Endpoints de Autenticación

### POST /api/auth/registro

Registra un nuevo cliente.

**Método**: `POST`
**URL**: `/api/auth/registro`
**Público**: ✅ Sí

**Body**:

```json
{
  "nombre": "Sofía",
  "apellido": "Márquez",
  "email": "sofia@example.com",
  "telefono": "+52 555 123 4567",
  "password": "MiPassword123!"
}
```

**Campos**:

| Campo | Tipo | Requerido | Validación |
|-------|------|:---------:|------------|
| `nombre` | string | ✅ | No vacío |
| `apellido` | string | ✅ | No vacío |
| `email` | string | ✅ | Formato válido, único |
| `telefono` | string | ❌ | ≤20 caracteres |
| `password` | string | ✅ | Mínimo 6 caracteres |

**Response 201**:

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "clienteID": 45,
      "nombre": "Sofía",
      "apellido": "Márquez",
      "email": "sofia@example.com",
      "telefono": "+52 555 123 4567",
      "esVIP": false,
      "activo": true
    }
  },
  "meta": { "message": "Registro exitoso" }
}
```

**Errores**:

| Código | HTTP | Cuándo |
|--------|:----:|--------|
| `VALIDATION_ERROR` | 400 | Campos faltantes o inválidos |
| `EMAIL_ALREADY_EXISTS` | 409 | El email ya está registrado |

---

### POST /api/auth/login

Login de cliente.

**Método**: `POST`
**URL**: `/api/auth/login`
**Público**: ✅ Sí

**Body**:

```json
{
  "email": "sofia@example.com",
  "password": "MiPassword123!"
}
```

**Response 200**:

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "clienteID": 45,
      "nombre": "Sofía",
      "apellido": "Márquez",
      "email": "sofia@example.com",
      "telefono": "+52 555 123 4567",
      "esVIP": false,
      "activo": true
    }
  },
  "meta": { "message": "Login exitoso" }
}
```

**Errores**:

| Código | HTTP | Cuándo |
|--------|:----:|--------|
| `VALIDATION_ERROR` | 400 | Email o contraseña faltantes |
| `INVALID_CREDENTIALS` | 401 | Email o contraseña incorrectos |
| `ACCOUNT_DISABLED` | 403 | Cuenta desactivada |
| `TOO_MANY_LOGIN_ATTEMPTS` | 429 | Demasiados intentos (rate limit) |

---

### POST /api/auth/login-admin

Login de administrador.

**Método**: `POST`
**URL**: `/api/auth/login-admin`
**Público**: ✅ Sí

**Body**:

```json
{
  "email": "admin@elysee.com",
  "password": "Admin123!"
}
```

**Response 200**:

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "usuarioID": 1,
      "email": "admin@elysee.com",
      "nombre": "Administrador ELYSEE",
      "rol": "admin",
      "activo": true
    }
  },
  "meta": { "message": "Login de admin exitoso" }
}
```

**Errores**:

| Código | HTTP | Cuándo |
|--------|:----:|--------|
| `INVALID_CREDENTIALS` | 401 | Credenciales incorrectas |
| `ACCOUNT_DISABLED` | 403 | Cuenta desactivada |
| `TOO_MANY_LOGIN_ATTEMPTS` | 429 | Demasiados intentos |

---

### GET /api/auth/me

Obtiene los datos del usuario logueado.

**Método**: `GET`
**URL**: `/api/auth/me`
**Requiere JWT**: ✅ Sí (cliente o admin)

**Response 200 (cliente)**:

```json
{
  "data": {
    "clienteID": 45,
    "nombre": "Sofía",
    "apellido": "Márquez",
    "email": "sofia@example.com",
    "telefono": "+52 555 123 4567",
    "preferencias": "Alergia a mariscos",
    "esVIP": false,
    "activo": true,
    "fechaRegistro": "2026-10-06T15:30:00Z",
    "ultimoLogin": "2026-10-06T20:45:00Z",
    "role": "cliente"
  }
}
```

**Response 200 (admin)**:

```json
{
  "data": {
    "usuarioID": 1,
    "email": "admin@elysee.com",
    "nombre": "Administrador ELYSEE",
    "rol": "admin",
    "activo": true,
    "fechaCreacion": "2026-10-06T15:30:00Z",
    "ultimoLogin": "2026-10-06T20:45:00Z",
    "role": "admin"
  }
}
```

**Errores**:

| Código | HTTP | Cuándo |
|--------|:----:|--------|
| `UNAUTHORIZED` | 401 | Sin token |
| `INVALID_TOKEN` | 401 | Token inválido |
| `TOKEN_EXPIRED` | 401 | Token expirado |

---

### POST /api/auth/logout

Cierra la sesión. Como JWT es stateless, este endpoint solo confirma semánticamente. El cliente debe **borrar el token del localStorage**.

**Método**: `POST`
**URL**: `/api/auth/logout`
**Requiere JWT**: ✅ Sí

**Response 200**:

```json
{
  "data": null,
  "meta": { "message": "Sesion cerrada. Borra el token en el cliente." }
}
```

---

## Endpoints de Cliente

Todos requieren JWT con `role: "cliente"`.

### GET /api/cliente/reservaciones

Obtiene todas las reservaciones del cliente logueado.

**Método**: `GET`
**URL**: `/api/cliente/reservaciones`
**Requiere JWT**: ✅ Sí (`cliente`)

**Response 200**:

```json
{
  "data": [
    {
      "reservacionID": 89,
      "numeroPersonas": 2,
      "estado": "Pendiente",
      "notas": "Prueba",
      "fechaCreacion": "2026-10-06T20:00:00Z",
      "mesa": {
        "mesaID": 1,
        "numeroMesa": "T1",
        "ubicacion": "Terraza"
      },
      "agenda": {
        "agendaID": 45,
        "fecha": "2026-10-07",
        "horaInicio": "17:00",
        "horaFin": "19:00",
        "duracionMin": 120
      }
    }
  ],
  "meta": { "total": 1 }
}
```

---

### PATCH /api/cliente/reservaciones/:id/cancelar

Cancela una reservación propia.

**Método**: `PATCH`
**URL**: `/api/cliente/reservaciones/:id/cancelar`
**Requiere JWT**: ✅ Sí (`cliente`)

**Response 200**:

```json
{
  "data": {
    "reservacionID": 89,
    "numeroPersonas": 2,
    "estado": "Cancelada",
    "mesa": { },
    "agenda": { }
  },
  "meta": { "message": "Reservacion cancelada" }
}
```

**Errores**:

| Código | HTTP | Cuándo |
|--------|:----:|--------|
| `NOT_FOUND` | 404 | La reservación no existe o no pertenece al cliente |
| `INVALID_STATE_TRANSITION` | 422 | El estado actual no permite cancelación |

---

## Endpoints de Administrador

Todos requieren JWT con `role: "admin"` o `role: "staff"`.

### GET /api/admin/stats

Estadísticas generales del sistema.

**Método**: `GET`
**URL**: `/api/admin/stats`
**Requiere JWT**: ✅ Sí (`admin` o `staff`)

**Response 200**:

```json
{
  "data": {
    "totalClientes": 25,
    "totalMesas": 13,
    "totalReservaciones": 42,
    "pendientes": 15,
    "confirmadas": 18,
    "completadas": 6,
    "canceladas": 3
  }
}
```

---

### GET /api/admin/reservaciones

Lista todas las reservaciones. Acepta filtros opcionales.

**Método**: `GET`
**URL**: `/api/admin/reservaciones`
**Requiere JWT**: ✅ Sí (`admin` o `staff`)

**Query params**:

| Param | Tipo | Requerido | Descripción |
|-------|------|:---------:|-------------|
| `estado` | string | ❌ | Pendiente, Confirmada, Cancelada, Completada, NoShow |
| `fecha` | string (`YYYY-MM-DD`) | ❌ | Filtrar por fecha |

**Response 200**:

```json
{
  "data": [
    {
      "reservacionID": 89,
      "numeroPersonas": 2,
      "estado": "Pendiente",
      "notas": "Prueba",
      "fechaCreacion": "2026-10-06T20:00:00Z",
      "cliente": {
        "clienteID": 30,
        "nombre": "Javier",
        "apellido": "Ortega",
        "email": "javier@example.com",
        "telefono": "+52 555 987 6543",
        "esVIP": false
      },
      "mesa": {
        "mesaID": 1,
        "numeroMesa": "T1",
        "ubicacion": "Terraza"
      },
      "agenda": {
        "agendaID": 45,
        "fecha": "2026-10-07",
        "horaInicio": "17:00",
        "horaFin": "19:00",
        "duracionMin": 120
      }
    }
  ],
  "meta": { "total": 42 }
}
```

---

### PATCH /api/admin/reservaciones/:id/estado

Cambia el estado de cualquier reservación.

**Método**: `PATCH`
**URL**: `/api/admin/reservaciones/:id/estado`
**Requiere JWT**: ✅ Sí (`admin` o `staff`)

**Body**:

```json
{ "estado": "Confirmada" }
```

**Response 200**:

```json
{
  "data": {
    "reservacionID": 89,
    "estado": "Confirmada",
    "mesa": { },
    "agenda": { }
  },
  "meta": { "message": "Estado cambiado a 'Confirmada'" }
}
```

**Errores**:

| Código | HTTP | Cuándo |
|--------|:----:|--------|
| `INVALID_STATE_TRANSITION` | 422 | Transición no permitida |
| `NOT_FOUND` | 404 | Reservación no existe |

---

### GET /api/admin/clientes

Lista todos los clientes del sistema.

**Método**: `GET`
**URL**: `/api/admin/clientes`
**Requiere JWT**: ✅ Sí (`admin` o `staff`)

**Response 200**:

```json
{
  "data": [
    {
      "clienteID": 30,
      "nombre": "Javier",
      "apellido": "Ortega",
      "email": "javier@example.com",
      "telefono": "+52 555 987 6543",
      "esVIP": false,
      "activo": true,
      "fechaRegistro": "2026-10-06T15:30:00Z",
      "ultimoLogin": "2026-10-06T20:45:00Z"
    }
  ],
  "meta": { "total": 25 }
}
```

---

## Endpoints públicos

### Endpoints de Mesas

#### GET /api/mesas

Lista todas las mesas con filtros opcionales.

**Método**: `GET`
**URL**: `/api/mesas`
**Público**: ✅ Sí

**Query params**:

| Param | Tipo | Requerido | Descripción |
|-------|------|:---------:|-------------|
| `ubicacion` | string | ❌ | Filtrar por zona |
| `capacidadMinima` | int | ❌ | Capacidad mínima requerida |
| `estado` | string | ❌ | Disponible, Ocupada, etc. |

**Response 200**:

```json
{
  "data": [
    {
      "mesaID": 1,
      "numeroMesa": "T1",
      "capacidad": 2,
      "ubicacion": "Terraza",
      "estado": "Disponible"
    }
  ],
  "meta": { "total": 13 }
}
```

---

#### GET /api/mesas/disponibles

Consulta las mesas disponibles en una fecha, hora y duración específicas. **Endpoint clave del flujo de reservación.**

**Método**: `GET`
**URL**: `/api/mesas/disponibles`
**Público**: ✅ Sí

**Query params**:

| Param | Tipo | Requerido | Descripción |
|-------|------|:---------:|-------------|
| `fecha` | string (`YYYY-MM-DD`) | ✅ | Fecha de la reservación |
| `horaInicio` | string (`HH:MM`) | ✅ | Hora de inicio |
| `duracionMin` | int | ✅ | Duración (30–180) |
| `personas` | int | ✅ | Número de comensales |

**Ejemplo**: `/api/mesas/disponibles?fecha=2026-11-01&horaInicio=20:00&duracionMin=120&personas=4`

**Response 200**:

```json
{
  "data": [
    {
      "mesaID": 5,
      "numeroMesa": "S2",
      "capacidad": 4,
      "ubicacion": "Salon Principal",
      "estado": "Disponible"
    }
  ],
  "meta": {
    "total": 6,
    "consulta": {
      "fecha": "2026-11-01",
      "horaInicio": "20:00",
      "horaFin": "22:00",
      "duracionMin": 120,
      "personas": 4
    }
  }
}
```

---

### Endpoints de Reservaciones

#### POST /api/reservaciones

Crea una reservación nueva. **Requiere autenticación de cliente.**

**Método**: `POST`
**URL**: `/api/reservaciones`
**Requiere JWT**: ✅ Sí (`cliente`)

**Body**:

```json
{
  "mesaID": 5,
  "fecha": "2026-11-01",
  "horaInicio": "20:00",
  "duracionMin": 120,
  "numeroPersonas": 4,
  "notas": "Aniversario"
}
```

**Campos**:

| Campo | Tipo | Requerido | Validación |
|-------|------|:---------:|------------|
| `mesaID` | int | ✅ | Debe existir |
| `fecha` | string (`YYYY-MM-DD`) | ✅ | Hoy o futuro |
| `horaInicio` | string (`HH:MM`) | ✅ | Entre 08:00 y 23:00 |
| `duracionMin` | int | ✅ | Entre 30 y 180 |
| `numeroPersonas` | int | ✅ | 1–20, ≤ capacidad de la mesa |
| `notas` | string | ❌ | ≤300 caracteres |

**Response 201**:

```json
{
  "data": {
    "reservacionID": 90,
    "numeroPersonas": 4,
    "estado": "Pendiente",
    "notas": "Aniversario",
    "fechaCreacion": "2026-10-06T21:00:00Z",
    "cliente": {
      "clienteID": 30,
      "nombre": "Javier",
      "apellido": "Ortega",
      "email": "javier@example.com",
      "telefono": "+52 555 987 6543"
    },
    "mesa": {
      "mesaID": 5,
      "numeroMesa": "S2",
      "capacidad": 4,
      "ubicacion": "Salon Principal"
    },
    "agenda": {
      "agendaID": 46,
      "fecha": "2026-11-01",
      "horaInicio": "20:00",
      "horaFin": "22:00",
      "duracionMin": 120
    }
  },
  "meta": { "agendaCreada": true, "message": "Reservacion creada exitosamente" }
}
```

**Errores**:

| Código | HTTP | Cuándo |
|--------|:----:|--------|
| `UNAUTHORIZED` | 401 | Sin token |
| `TABLE_ALREADY_RESERVED` | 409 | Solapamiento en la mesa |
| `RESTAURANT_FULL` | 409 | Capacidad global superada |
| `DATE_IN_PAST` | 422 | Fecha en el pasado |
| `CAPACITY_EXCEEDED` | 422 | Personas > capacidad de mesa |
| `INVALID_DURATION` | 422 | Duración fuera de rango |

---

#### GET /api/reservaciones/:id

Obtiene el detalle completo de una reservación.

**Método**: `GET`
**URL**: `/api/reservaciones/:id`
**Público**: ✅ Sí

**Response 200**:

```json
{
  "data": {
    "reservacionID": 90,
    "numeroPersonas": 4,
    "estado": "Pendiente",
    "notas": "Aniversario",
    "fechaCreacion": "2026-10-06T21:00:00Z",
    "cliente": {
      "clienteID": 30,
      "nombre": "Javier",
      "apellido": "Ortega",
      "email": "javier@example.com"
    },
    "mesa": {
      "mesaID": 5,
      "numeroMesa": "S2",
      "capacidad": 4,
      "ubicacion": "Salon Principal"
    },
    "agenda": {
      "agendaID": 46,
      "fecha": "2026-11-01",
      "horaInicio": "20:00",
      "horaFin": "22:00",
      "duracionMin": 120
    }
  }
}
```

---

## Notas para el frontend

- Todos los endpoints devuelven **JSON** con `Content-Type: application/json`.
- Los errores **siempre** siguen el formato `{ error: { code, message } }`.
- Los códigos de error (`code`) son **estables** y pueden usarse para mostrar mensajes localizados sin parsear el mensaje en sí.
- El endpoint `GET /api/mesas/disponibles` es **idempotente**.
- El endpoint `POST /api/reservaciones` es **NO idempotente**. Requiere JWT.
- El interceptor de axios debe inyectar `Authorization: Bearer <token>` en cada request.

## Notas para el backend

- Todos los inputs deben validarse antes de tocar la BD.
- Los errores de BD deben mapearse a códigos de error consistentes.
- La creación de reservación debe ser **transaccional** con `UPDLOCK`.
- Los timestamps se devuelven en UTC con formato ISO 8601.
- **NUNCA** exponer el `PasswordHash` en respuestas.

## Versionado

La API está en `v1` (implícita en la URL base, sin prefijo). Si en el futuro se necesitan cambios rompientes, se introducirá `/api/v2/...` y se mantendrá `v1` por un periodo de transición.
