h1: Especificacion de la API REST

text: |
  Documentacion de los endpoints REST del sistema de reservas ELYSEE.

  Base URL desarrollo: http://localhost:3000/api
  Base URL produccion: https://api.elysee-reservas.com/api (a definir)
  Version actual: v1
  Formato: JSON UTF-8

h2: Indice

list:
  - Convenciones
  - Codigos de estado
  - Formato de errores
  - Autenticacion
  - Endpoints de Autenticacion
  - Endpoints de Cliente
  - Endpoints de Administrador
  - Endpoints publicos
  - Notas para el frontend
  - Notas para el backend
  - Versionado

separator: true

h2: Convenciones

h3: Estructura de URLs

code_lang: text
content: |
  /api/recurso              -> coleccion
  /api/recurso/:id          -> item especifico
  /api/recurso/:id/accion   -> accion sobre un item

h3: Formato de request

list:
  - "Content-Type: application/json"
  - "Accept: application/json"
  - "Fechas: ISO 8601 (YYYY-MM-DD para fechas, HH:MM para horas)"
  - "Strings: UTF-8"
  - "Autorizacion: header Authorization: Bearer <token> para endpoints protegidos"

h3: Formato de response exitosa

text: "Objeto unico:"

code_lang: json
content: |
  {
    "data": {
      "id": 1,
      "nombre": "Sofia"
    }
  }

text: "Lista:"

code_lang: json
content: |
  {
    "data": [
      { "id": 1, "nombre": "Sofia" },
      { "id": 2, "nombre": "Alejandro" }
    ],
    "meta": {
      "total": 2
    }
  }

h3: Formato de response de error

code_lang: json
content: |
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "El campo email es obligatorio",
      "details": [
        { "field": "email", "message": "Requerido" }
      ]
    }
  }

separator: true

h2: Codigos de estado

table:
  columns:
    - Codigo
    - Significado
    - Cuando se usa
  rows:
    - ["200 OK", "Exito", "GET, PATCH exitosos"]
    - ["201 Created", "Recurso creado", "POST exitoso"]
    - ["400 Bad Request", "Error de validacion", "Faltan campos, formato invalido"]
    - ["401 Unauthorized", "Sin autenticacion", "Token faltante, invalido o expirado"]
    - ["403 Forbidden", "Sin permisos", "Token valido pero sin rol suficiente"]
    - ["404 Not Found", "Recurso no encontrado", "ID no existe"]
    - ["409 Conflict", "Conflicto de negocio", "Email duplicado, mesa ya reservada"]
    - ["422 Unprocessable Entity", "Semanticamente invalido", "Fecha en el pasado, capacidad excedida"]
    - ["429 Too Many Requests", "Rate limit excedido", "Demasiados intentos de login"]
    - ["500 Internal Server Error", "Error del servidor", "Bug, fallo de BD"]

separator: true

h2: Formato de errores

text: "Cada error incluye un code (identificador estable) y un message legible."

table:
  columns:
    - Codigo
    - HTTP
    - Descripcion
  rows:
    - ["VALIDATION_ERROR", "400", "Campos invalidos o faltantes"]
    - ["UNAUTHORIZED", "401", "No hay token"]
    - ["INVALID_TOKEN", "401", "Token malformado o firma invalida"]
    - ["TOKEN_EXPIRED", "401", "Token expirado (re-loguear)"]
    - ["INVALID_CREDENTIALS", "401", "Email o contrasena incorrectos"]
    - ["ACCOUNT_DISABLED", "403", "Cuenta desactivada"]
    - ["FORBIDDEN", "403", "Token valido pero sin permisos"]
    - ["NOT_FOUND", "404", "Recurso no existe"]
    - ["EMAIL_ALREADY_EXISTS", "409", "Email ya registrado"]
    - ["TABLE_ALREADY_RESERVED", "409", "Mesa ya reservada en ese horario"]
    - ["RESTAURANT_FULL", "409", "Capacidad global excedida"]
    - ["DATE_IN_PAST", "422", "No se puede reservar en el pasado"]
    - ["CAPACITY_EXCEEDED", "422", "Personas > capacidad de mesa"]
    - ["INVALID_DURATION", "422", "Duracion fuera de rango"]
    - ["INVALID_STATE_TRANSITION", "422", "Cambio de estado no permitido"]
    - ["TOO_MANY_LOGIN_ATTEMPTS", "429", "Demasiados intentos de login"]
    - ["INTERNAL_ERROR", "500", "Error interno del servidor"]

separator: true

h2: Autenticacion

text: "Todos los endpoints protegidos usan JWT con algoritmo HS256 y expiracion de 24 horas."

h3: Formato del header

code_lang: text
content: |
  Authorization: Bearer <token>

h3: Payload del JWT

code_lang: json
content: |
  {
    "userID": 45,
    "email": "sofia@example.com",
    "role": "cliente",
    "iat": 1728000000,
    "exp": 1728086400
  }

h3: Roles

table:
  columns:
    - Rol
    - Origen
    - Acceso
  rows:
    - ["cliente", "Tabla Clientes", "Endpoints /api/cliente/* y POST /api/reservaciones"]
    - ["admin", "Tabla Usuarios", "Todos los endpoints /api/admin/*"]
    - ["staff", "Tabla Usuarios", "Igual que admin"]

separator: true

h2: Endpoints de Autenticacion

h3: POST /api/auth/registro

text: "Registra un nuevo cliente."

list:
  - "Metodo: POST"
  - "URL: /api/auth/registro"
  - "Publico: Si"

text: "Body:"

code_lang: json
content: |
  {
    "nombre": "Sofia",
    "apellido": "Marquez",
    "email": "sofia@example.com",
    "telefono": "+52 555 123 4567",
    "password": "MiPassword123!"
  }

text: "Campos:"

table:
  columns:
    - Campo
    - Tipo
    - Requerido
    - Validacion
  rows:
    - ["nombre", "string", "Si", "No vacio"]
    - ["apellido", "string", "Si", "No vacio"]
    - ["email", "string", "Si", "Formato valido, unico"]
    - ["telefono", "string", "No", "Max 20 caracteres"]
    - ["password", "string", "Si", "Minimo 6 caracteres"]

text: "Response 201:"

code_lang: json
content: |
  {
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "clienteID": 45,
        "nombre": "Sofia",
        "apellido": "Marquez",
        "email": "sofia@example.com",
        "telefono": "+52 555 123 4567",
        "esVIP": false,
        "activo": true
      }
    },
    "meta": { "message": "Registro exitoso" }
  }

text: "Errores:"

table:
  columns:
    - Codigo
    - HTTP
    - Cuando
  rows:
    - ["VALIDATION_ERROR", "400", "Campos faltantes o invalidos"]
    - ["EMAIL_ALREADY_EXISTS", "409", "El email ya esta registrado"]

separator: true

h3: POST /api/auth/login

text: "Login de cliente."

list:
  - "Metodo: POST"
  - "URL: /api/auth/login"
  - "Publico: Si"

text: "Body:"

code_lang: json
content: |
  {
    "email": "sofia@example.com",
    "password": "MiPassword123!"
  }

text: "Response 200:"

code_lang: json
content: |
  {
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "clienteID": 45,
        "nombre": "Sofia",
        "apellido": "Marquez",
        "email": "sofia@example.com",
        "telefono": "+52 555 123 4567",
        "esVIP": false,
        "activo": true
      }
    },
    "meta": { "message": "Login exitoso" }
  }

text: "Errores:"

table:
  columns:
    - Codigo
    - HTTP
    - Cuando
  rows:
    - ["VALIDATION_ERROR", "400", "Email o contrasena faltantes"]
    - ["INVALID_CREDENTIALS", "401", "Email o contrasena incorrectos"]
    - ["ACCOUNT_DISABLED", "403", "Cuenta desactivada"]
    - ["TOO_MANY_LOGIN_ATTEMPTS", "429", "Demasiados intentos (rate limit)"]

separator: true

h3: POST /api/auth/login-admin

text: "Login de administrador."

list:
  - "Metodo: POST"
  - "URL: /api/auth/login-admin"
  - "Publico: Si"

text: "Body:"

code_lang: json
content: |
  {
    "email": "admin@elysee.com",
    "password": "Admin123!"
  }

text: "Response 200:"

code_lang: json
content: |
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

text: "Errores:"

table:
  columns:
    - Codigo
    - HTTP
    - Cuando
  rows:
    - ["INVALID_CREDENTIALS", "401", "Credenciales incorrectas"]
    - ["ACCOUNT_DISABLED", "403", "Cuenta desactivada"]
    - ["TOO_MANY_LOGIN_ATTEMPTS", "429", "Demasiados intentos"]

separator: true

h3: GET /api/auth/me

text: "Obtiene los datos del usuario logueado."

list:
  - "Metodo: GET"
  - "URL: /api/auth/me"
  - "Requiere JWT: Si (cliente o admin)"

text: "Response 200 (cliente):"

code_lang: json
content: |
  {
    "data": {
      "clienteID": 45,
      "nombre": "Sofia",
      "apellido": "Marquez",
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

text: "Response 200 (admin):"

code_lang: json
content: |
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

text: "Errores:"

table:
  columns:
    - Codigo
    - HTTP
    - Cuando
  rows:
    - ["UNAUTHORIZED", "401", "Sin token"]
    - ["INVALID_TOKEN", "401", "Token invalido"]
    - ["TOKEN_EXPIRED", "401", "Token expirado"]

separator: true

h3: POST /api/auth/logout

text: "Cierra la sesion. Como JWT es stateless, este endpoint solo confirma semanticamente. El cliente debe borrar el token del localStorage."

list:
  - "Metodo: POST"
  - "URL: /api/auth/logout"
  - "Requiere JWT: Si"

text: "Response 200:"

code_lang: json
content: |
  {
    "data": null,
    "meta": { "message": "Sesion cerrada. Borra el token en el cliente." }
  }

separator: true

h2: Endpoints de Cliente

text: "Todos requieren JWT con role: cliente."

h3: GET /api/cliente/reservaciones

text: "Obtiene todas las reservaciones del cliente logueado."

list:
  - "Metodo: GET"
  - "URL: /api/cliente/reservaciones"
  - "Requiere JWT: Si (cliente)"

text: "Response 200:"

code_lang: json
content: |
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

separator: true

h3: PATCH /api/cliente/reservaciones/:id/cancelar

text: "Cancela una reservacion propia."

list:
  - "Metodo: PATCH"
  - "URL: /api/cliente/reservaciones/:id/cancelar"
  - "Requiere JWT: Si (cliente)"

text: "Response 200:"

code_lang: json
content: |
  {
    "data": {
      "reservacionID": 89,
      "numeroPersonas": 2,
      "estado": "Cancelada",
      "mesa": { ... },
      "agenda": { ... }
    },
    "meta": { "message": "Reservacion cancelada" }
  }

text: "Errores:"

table:
  columns:
    - Codigo
    - HTTP
    - Cuando
  rows:
    - ["NOT_FOUND", "404", "La reservacion no existe o no pertenece al cliente"]
    - ["INVALID_STATE_TRANSITION", "422", "El estado actual no permite cancelacion"]

separator: true

h2: Endpoints de Administrador

text: "Todos requieren JWT con role: admin o staff."

h3: GET /api/admin/stats

text: "Estadisticas generales del sistema."

list:
  - "Metodo: GET"
  - "URL: /api/admin/stats"
  - "Requiere JWT: Si (admin o staff)"

text: "Response 200:"

code_lang: json
content: |
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

separator: true

h3: GET /api/admin/reservaciones

text: "Lista todas las reservaciones. Acepta filtros opcionales."

list:
  - "Metodo: GET"
  - "URL: /api/admin/reservaciones"
  - "Requiere JWT: Si (admin o staff)"

text: "Query params:"

table:
  columns:
    - Param
    - Tipo
    - Requerido
    - Descripcion
  rows:
    - ["estado", "string", "No", "Pendiente, Confirmada, Cancelada, Completada, NoShow"]
    - ["fecha", "string (YYYY-MM-DD)", "No", "Filtrar por fecha"]

text: "Response 200:"

code_lang: json
content: |
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

separator: true

h3: PATCH /api/admin/reservaciones/:id/estado

text: "Cambia el estado de cualquier reservacion."

list:
  - "Metodo: PATCH"
  - "URL: /api/admin/reservaciones/:id/estado"
  - "Requiere JWT: Si (admin o staff)"

text: "Body:"

code_lang: json
content: |
  { "estado": "Confirmada" }

text: "Response 200:"

code_lang: json
content: |
  {
    "data": {
      "reservacionID": 89,
      "estado": "Confirmada",
      "mesa": { ... },
      "agenda": { ... }
    },
    "meta": { "message": "Estado cambiado a Confirmada" }
  }

text: "Errores:"

table:
  columns:
    - Codigo
    - HTTP
    - Cuando
  rows:
    - ["INVALID_STATE_TRANSITION", "422", "Transicion no permitida"]
    - ["NOT_FOUND", "404", "Reservacion no existe"]

separator: true

h3: GET /api/admin/clientes

text: "Lista todos los clientes del sistema."

list:
  - "Metodo: GET"
  - "URL: /api/admin/clientes"
  - "Requiere JWT: Si (admin o staff)"

text: "Response 200:"

code_lang: json
content: |
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

separator: true

h2: Endpoints publicos

h3: Endpoints de Mesas

h4: GET /api/mesas

text: "Lista todas las mesas con filtros opcionales."

list:
  - "Metodo: GET"
  - "URL: /api/mesas"
  - "Publico: Si"

text: "Query params:"

table:
  columns:
    - Param
    - Tipo
    - Requerido
    - Descripcion
  rows:
    - ["ubicacion", "string", "No", "Filtrar por zona"]
    - ["capacidadMinima", "int", "No", "Capacidad minima requerida"]
    - ["estado", "string", "No", "Disponible, Ocupada, etc."]

text: "Response 200:"

code_lang: json
content: |
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

separator: true

h4: GET /api/mesas/disponibles

text: "Consulta las mesas disponibles en una fecha, hora y duracion especificas. Endpoint clave del flujo de reservacion."

list:
  - "Metodo: GET"
  - "URL: /api/mesas/disponibles"
  - "Publico: Si"

text: "Query params:"

table:
  columns:
    - Param
    - Tipo
    - Requerido
    - Descripcion
  rows:
    - ["fecha", "string (YYYY-MM-DD)", "Si", "Fecha de la reservacion"]
    - ["horaInicio", "string (HH:MM)", "Si", "Hora de inicio"]
    - ["duracionMin", "int", "Si", "Duracion (30-180)"]
    - ["personas", "int", "Si", "Numero de comensales"]

text: "Ejemplo: /api/mesas/disponibles?fecha=2026-11-01&horaInicio=20:00&duracionMin=120&personas=4"

text: "Response 200:"

code_lang: json
content: |
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

separator: true

h2: Endpoints de Reservaciones

h3: POST /api/reservaciones

text: "Crea una reservacion nueva. Requiere autenticacion de cliente."

list:
  - "Metodo: POST"
  - "URL: /api/reservaciones"
  - "Requiere JWT: Si (cliente)"

text: "Body:"

code_lang: json
content: |
  {
    "mesaID": 5,
    "fecha": "2026-11-01",
    "horaInicio": "20:00",
    "duracionMin": 120,
    "numeroPersonas": 4,
    "notas": "Aniversario"
  }

text: "Campos:"

table:
  columns:
    - Campo
    - Tipo
    - Requerido
    - Validacion
  rows:
    - ["mesaID", "int", "Si", "Debe existir"]
    - ["fecha", "string (YYYY-MM-DD)", "Si", "Hoy o futuro"]
    - ["horaInicio", "string (HH:MM)", "Si", "Entre 08:00 y 23:00"]
    - ["duracionMin", "int", "Si", "Entre 30 y 180"]
    - ["numeroPersonas", "int", "Si", "1-20, menor o igual a capacidad de la mesa"]
    - ["notas", "string", "No", "Max 300 caracteres"]

text: "Response 201:"

code_lang: json
content: |
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

text: "Errores:"

table:
  columns:
    - Codigo
    - HTTP
    - Cuando
  rows:
    - ["UNAUTHORIZED", "401", "Sin token"]
    - ["TABLE_ALREADY_RESERVED", "409", "Solapamiento en la mesa"]
    - ["RESTAURANT_FULL", "409", "Capacidad global superada"]
    - ["DATE_IN_PAST", "422", "Fecha en el pasado"]
    - ["CAPACITY_EXCEEDED", "422", "Personas mayor a capacidad de mesa"]
    - ["INVALID_DURATION", "422", "Duracion fuera de rango"]

separator: true

h3: GET /api/reservaciones/:id

text: "Obtiene el detalle completo de una reservacion."

list:
  - "Metodo: GET"
  - "URL: /api/reservaciones/:id"
  - "Publico: Si"

text: "Response 200:"

code_lang: json
content: |
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

separator: true

h2: Notas para el frontend

list:
  - "Todos los endpoints devuelven JSON con Content-Type: application/json."
  - "Los errores siempre siguen el formato { error: { code, message } }."
  - "Los codigos de error (code) son estables y pueden usarse para mostrar mensajes localizados sin parsear el mensaje en si."
  - "El endpoint GET /api/mesas/disponibles es idempotente."
  - "El endpoint POST /api/reservaciones es NO idempotente. Requiere JWT."
  - "El interceptor de axios debe inyectar Authorization: Bearer token en cada request."

h2: Notas para el backend

list:
  - "Todos los inputs deben validarse antes de tocar la BD."
  - "Los errores de BD deben mapearse a codigos de error consistentes."
  - "La creacion de reservacion debe ser transaccional con UPDLOCK."
  - "Los timestamps se devuelven en UTC con formato ISO 8601."
  - "NUNCA exponer el PasswordHash en respuestas."

h2: Versionado

text: "La API esta en v1 (implicita en la URL base, sin prefijo). Si en el futuro se necesitan cambios rompientes, se introducira /api/v2/... y se mantendra v1 por un periodo de transicion."