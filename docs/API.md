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
- [Endpoints de Clientes](#endpoints-de-clientes)
  - [POST /api/clientes](#post-apiclientes)
  - [GET /api/clientes/:email](#get-apiclientesemail)
- [Endpoints de Mesas](#endpoints-de-mesas)
  - [GET /api/mesas](#get-apimesas)
  - [GET /api/mesas/disponibles](#get-apimesasdisponibles)
- [Endpoints de Reservaciones](#endpoints-de-reservaciones)
  - [POST /api/reservaciones](#post-apireservaciones)
  - [GET /api/reservaciones/:id](#get-apireservacionesid)
  - [PATCH /api/reservaciones/:id/estado](#patch-apireservacionesidestado)

---

## Convenciones

### Estructura de URLs

```
/api/<recurso>              → colección
/api/<recurso>/:id          → item específico
/api/<recurso>/:id/<acción> → acción sobre un item
```

### Formato de request

- **Content-Type**: `application/json`
- **Accept**: `application/json`
- **Fechas**: ISO 8601 (`YYYY-MM-DD` para fechas, `HH:MM` para horas)
- **Strings**: UTF-8

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
| `404 Not Found` | Recurso no encontrado | ID no existe |
| `409 Conflict` | Conflicto de negocio | Email duplicado, mesa ya reservada |
| `422 Unprocessable Entity` | Semánticamente inválido | Fecha en el pasado, capacidad excedida |
| `500 Internal Server Error` | Error del servidor | Bug, fallo de BD |

---

## Formato de errores

Cada error incluye un `code` (identificador estable) y un `message` legible.

| Código | HTTP | Descripción |
|--------|------|-------------|
| `VALIDATION_ERROR` | 400 | Campos inválidos o faltantes |
| `NOT_FOUND` | 404 | Recurso no existe |
| `EMAIL_ALREADY_EXISTS` | 409 | Email ya registrado |
| `TABLE_ALREADY_RESERVED` | 409 | Mesa ya reservada en esa hora |
| `DATE_IN_PAST` | 422 | No se puede reservar en el pasado |
| `CAPACITY_EXCEEDED` | 422 | Número de personas mayor a la capacidad |
| `INVALID_STATE_TRANSITION` | 422 | Cambio de estado no permitido |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |

---

## Endpoints de Clientes

### POST /api/clientes

Crea un cliente nuevo o devuelve el existente si el email ya está registrado.
Es **idempotente** por email.

**Método**: `POST`
**URL**: `/api/clientes`
**Body**:

```json
{
  "nombre": "Sofía",
  "apellido": "Márquez",
  "email": "sofia@example.com",
  "telefono": "+52 555 123 4567",
  "preferencias": "Alergia a mariscos",
  "esVIP": false
}
```

**Campos:**

| Campo | Tipo | Requerido | Validación |
|-------|------|:---------:|------------|
| `nombre` | string | ✅ | 1–100 caracteres |
| `apellido` | string | ✅ | 1–100 caracteres |
| `email` | string | ✅ | Formato email válido, ≤150 caracteres |
| `telefono` | string | ❌ | ≤20 caracteres |
| `preferencias` | string | ❌ | ≤500 caracteres |
| `esVIP` | boolean | ❌ | Default `false` |

**Response 201 (creado):**

```json
{
  "data": {
    "clienteID": 1,
    "nombre": "Sofía",
    "apellido": "Márquez",
    "email": "sofia@example.com",
    "telefono": "+52 555 123 4567",
    "preferencias": "Alergia a mariscos",
    "esVIP": false,
    "fechaRegistro": "2026-09-27T19:30:00Z"
  }
}
```

**Response 200 (ya existía):**

```json
{
  "data": {
    "clienteID": 1,
    "nombre": "Sofía",
    "apellido": "Márquez",
    "email": "sofia@example.com",
    "esVIP": false,
    "fechaRegistro": "2026-09-27T19:30:00Z"
  },
  "meta": {
    "created": false,
    "message": "El cliente ya existía con este email"
  }
}
```

**Response 400 (validación):**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El email no tiene un formato válido",
    "details": [
      { "field": "email", "message": "Formato inválido" }
    ]
  }
}
```

---

### GET /api/clientes/:email

Busca un cliente por email.

**Método**: `GET`
**URL**: `/api/clientes/:email`
**Ejemplo**: `/api/clientes/sofia@example.com`

**Response 200:**

```json
{
  "data": {
    "clienteID": 1,
    "nombre": "Sofía",
    "apellido": "Márquez",
    "email": "sofia@example.com",
    "telefono": "+52 555 123 4567",
    "preferencias": "Alergia a mariscos",
    "esVIP": false,
    "fechaRegistro": "2026-09-27T19:30:00Z"
  }
}
```

**Response 404:**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "No se encontró un cliente con ese email"
  }
}
```

---

## Endpoints de Mesas

### GET /api/mesas

Lista todas las mesas con filtros opcionales.

**Método**: `GET`
**URL**: `/api/mesas`
**Query params:**

| Param | Tipo | Requerido | Descripción |
|-------|------|:---------:|-------------|
| `ubicacion` | string | ❌ | Filtrar por zona (`Terraza`, `Salón Principal`, etc.) |
| `capacidadMinima` | int | ❌ | Capacidad mínima requerida |
| `estado` | string | ❌ | Filtrar por estado (`Disponible`, `Ocupada`, etc.) |

**Ejemplo**: `/api/mesas?ubicacion=Terraza&capacidadMinima=2`

**Response 200:**

```json
{
  "data": [
    {
      "mesaID": 1,
      "numeroMesa": "T1",
      "capacidad": 2,
      "ubicacion": "Terraza",
      "estado": "Disponible"
    },
    {
      "mesaID": 2,
      "numeroMesa": "T2",
      "capacidad": 2,
      "ubicacion": "Terraza",
      "estado": "Disponible"
    }
  ],
  "meta": {
    "total": 2,
    "filtros": {
      "ubicacion": "Terraza",
      "capacidadMinima": 2
    }
  }
}
```

---

### GET /api/mesas/disponibles

Consulta las mesas disponibles en una fecha, hora y número de personas
específicas. Este es **el endpoint más importante del sistema** porque lo
consume el flujo principal de reservación.

**Método**: `GET`
**URL**: `/api/mesas/disponibles`
**Query params:**

| Param | Tipo | Requerido | Descripción |
|-------|------|:---------:|-------------|
| `fecha` | string (`YYYY-MM-DD`) | ✅ | Fecha de la reservación |
| `hora` | string (`HH:MM`) | ✅ | Hora de llegada |
| `personas` | int | ✅ | Número de comensales |

**Ejemplo**: `/api/mesas/disponibles?fecha=2026-10-15&hora=20:00&personas=4`

**Lógica:**

1. Filtrar mesas con capacidad ≥ `personas`.
2. Filtrar mesas cuyo estado sea `Disponible`.
3. Excluir mesas que ya tengan una reservación activa
   (`Pendiente` o `Confirmada`) en la ventana de ±1 hora.

**Response 200:**

```json
{
  "data": [
    {
      "mesaID": 5,
      "numeroMesa": "S2",
      "capacidad": 4,
      "ubicacion": "Salón Principal"
    },
    {
      "mesaID": 6,
      "numeroMesa": "S3",
      "capacidad": 4,
      "ubicacion": "Salón Principal"
    },
    {
      "mesaID": 7,
      "numeroMesa": "S4",
      "capacidad": 6,
      "ubicacion": "Salón Principal"
    }
  ],
  "meta": {
    "total": 3,
    "consulta": {
      "fecha": "2026-10-15",
      "hora": "20:00",
      "personas": 4
    }
  }
}
```

**Response 400 (parámetros faltantes):**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Faltan parámetros requeridos",
    "details": [
      { "field": "fecha", "message": "Requerido" },
      { "field": "hora", "message": "Requerido" }
    ]
  }
}
```

---

## Endpoints de Reservaciones

### POST /api/reservaciones

Crea una reservación nueva. Este endpoint **valida disponibilidad en una
transacción** para prevenir doble reservación.

**Método**: `POST`
**URL**: `/api/reservaciones`
**Body:**

```json
{
  "clienteID": 1,
  "mesaID": 5,
  "fecha": "2026-10-15",
  "hora": "20:00",
  "numeroPersonas": 4,
  "notas": "Aniversario, vista jardín"
}
```

Alternativamente, si el cliente es nuevo, se pueden enviar los datos del
cliente en lugar de `clienteID`:

```json
{
  "cliente": {
    "nombre": "Sofía",
    "apellido": "Márquez",
    "email": "sofia@example.com",
    "telefono": "+52 555 123 4567"
  },
  "mesaID": 5,
  "fecha": "2026-10-15",
  "hora": "20:00",
  "numeroPersonas": 4,
  "notas": "Aniversario"
}
```

**Campos:**

| Campo | Tipo | Requerido | Validación |
|-------|------|:---------:|------------|
| `clienteID` | int | ⚠️ | Uno de los dos (`clienteID` o `cliente`) |
| `cliente` | object | ⚠️ | Uno de los dos |
| `mesaID` | int | ✅ | Debe existir |
| `fecha` | string (`YYYY-MM-DD`) | ✅ | Hoy o futuro |
| `hora` | string (`HH:MM`) | ✅ | Formato válido |
| `numeroPersonas` | int | ✅ | 1–20, ≤ capacidad de la mesa |
| `notas` | string | ❌ | ≤300 caracteres |

**Response 201:**

```json
{
  "data": {
    "reservacionID": 1,
    "cliente": {
      "clienteID": 1,
      "nombre": "Sofía",
      "apellido": "Márquez",
      "email": "sofia@example.com"
    },
    "mesa": {
      "mesaID": 5,
      "numeroMesa": "S2",
      "ubicacion": "Salón Principal",
      "capacidad": 4
    },
    "fecha": "2026-10-15",
    "hora": "20:00",
    "numeroPersonas": 4,
    "estado": "Pendiente",
    "notas": "Aniversario, vista jardín",
    "fechaCreacion": "2026-09-27T19:30:00Z"
  }
}
```

**Response 409 (mesa ya reservada):**

```json
{
  "error": {
    "code": "TABLE_ALREADY_RESERVED",
    "message": "La mesa S2 ya está reservada en ese horario"
  }
}
```

**Response 422 (fecha en el pasado):**

```json
{
  "error": {
    "code": "DATE_IN_PAST",
    "message": "No se puede reservar en una fecha pasada"
  }
}
```

**Response 422 (capacidad excedida):**

```json
{
  "error": {
    "code": "CAPACITY_EXCEEDED",
    "message": "La mesa S2 tiene capacidad para 4, se solicitaron 6"
  }
}
```

---

### GET /api/reservaciones/:id

Obtiene el detalle completo de una reservación.

**Método**: `GET`
**URL**: `/api/reservaciones/:id`
**Ejemplo**: `/api/reservaciones/1`

**Response 200:**

```json
{
  "data": {
    "reservacionID": 1,
    "cliente": {
      "clienteID": 1,
      "nombre": "Sofía",
      "apellido": "Márquez",
      "email": "sofia@example.com",
      "telefono": "+52 555 123 4567",
      "esVIP": false
    },
    "mesa": {
      "mesaID": 5,
      "numeroMesa": "S2",
      "ubicacion": "Salón Principal",
      "capacidad": 4
    },
    "fecha": "2026-10-15",
    "hora": "20:00",
    "numeroPersonas": 4,
    "estado": "Confirmada",
    "notas": "Aniversario, vista jardín",
    "fechaCreacion": "2026-09-27T19:30:00Z"
  }
}
```

**Response 404:**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "No se encontró la reservación con ID 1"
  }
}
```

---

### PATCH /api/reservaciones/:id/estado

Cambia el estado de una reservación (confirmar, cancelar, completar, no-show).

**Método**: `PATCH`
**URL**: `/api/reservaciones/:id/estado`
**Body:**

```json
{
  "estado": "Confirmada"
}
```

**Estados permitidos y transiciones:**

| Estado actual | Estados permitidos |
|---------------|-------------------|
| `Pendiente` | `Confirmada`, `Cancelada` |
| `Confirmada` | `Completada`, `Cancelada`, `NoShow` |
| `Cancelada` | (terminal — no cambia) |
| `Completada` | (terminal — no cambia) |
| `NoShow` | (terminal — no cambia) |

**Response 200:**

```json
{
  "data": {
    "reservacionID": 1,
    "estado": "Confirmada",
    "fechaModificacion": "2026-09-27T20:15:00Z"
  }
}
```

**Response 422 (transición inválida):**

```json
{
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "No se puede pasar de 'Cancelada' a 'Confirmada'"
  }
}
```

**Response 404:**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "No se encontró la reservación con ID 1"
  }
}
```

---

## Notas para el frontend

- Todos los endpoints devuelven **JSON** con `Content-Type: application/json`.
- Los errores **siempre** siguen el formato `{ error: { code, message } }`.
- Los códigos de error (`code`) son **estables** y pueden usarse para
  mostrar mensajes localizados sin parsear el mensaje en sí.
- El endpoint `GET /api/mesas/disponibles` es **idempotente** y puede
  llamarse múltiples veces sin efectos secundarios.
- El endpoint `POST /api/reservaciones` es **NO idempotente**. Si se
  necesita reintentar, el frontend debe verificar primero si la reservación
  ya se creó (por ejemplo, con `GET /api/reservaciones/:id`).

## Notas para el backend

- Todos los inputs deben validarse con Joi/Zod antes de tocar la BD.
- Los errores de BD deben mapearse a códigos de error consistentes.
- La creación de reservación debe ser **transaccional** con `UPDLOCK`.
- Los timestamps se devuelven en UTC con formato ISO 8601.
- El backend **no** debe exponer el password de SQL Server ni detalles
  internos en los mensajes de error de producción.

## Versionado

La API está en `v1` (implícita en la URL base, sin prefijo). Si en el
futuro se necesitan cambios rompientes, se introducirá `/api/v2/...` y
se mantendrá `v1` por un periodo de transición.