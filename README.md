# 🍽️ ÉLYSÉE Reservas

[![Backend CI](https://github.com/Javiersan237/Restaurant-Page-with_DB/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/Javiersan237/Restaurant-Page-with_DB/actions/workflows/backend-ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen)]()
[![SQL Server](https://img.shields.io/badge/sql%20server-%3E%3D2022-red)]()

Sistema de gestión de reservas para el restaurante de alta cocina **ÉLYSÉE**.
Permite a los clientes reservar mesas en línea y al restaurante administrar
mesas, horarios, agendas y reservaciones desde una API REST moderna.

## 🔗 Accesos Rápidos a Documentación
- [Guía de Despliegue en Producción](./docs/guia-despliegue.md)
- [Glosario del Sistema](./docs/glosario.md)
- [Registro de Cambios (Changelog)](./CHANGELOG.md)
- [Especificación de la API](./docs/API.md)
- [Diagrama Entidad-Relación (ERD)](./docs/ERD.md)

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js 18+ + Express 5 |
| Base de datos | SQL Server 2022 |
| Frontend | React + Vite + Tailwind CSS |
| Autenticación | JWT (pendiente) |
| Documentación | Markdown en `/docs` |
| CI/CD | GitHub Actions |
| Contenedores | Docker + Docker Compose |
| Control de versiones | Git + GitHub |

---

## 📐 Modelo de datos

El sistema usa **4 tablas** con `Reservaciones` como tabla puente:

```
┌─────────┐                    ┌─────────┐
│ Clientes│◄──┐                │  Agenda │
└─────────┘   │                └─────────┘
              │                    ▲
              │  ┌──────────────┐  │
              └──┤ Reservación  ├──┘
                 │  (tabla      │
                 │   puente)    │
                 └──────┬───────┘
                        │
                        ▼
                   ┌─────────┐
                   │  Mesa   │
                   └─────────┘
```

- **Clientes**: 20 clientes de prueba (5 VIP) vía seeds.
- **Mesas**: 13 mesas distribuidas en 4 zonas (50 personas en total).
- **Agendas**: bloques de tiempo reservables (30–180 min).
- **Reservaciones**: unen cliente + mesa + agenda.

---

## 📁 Estructura del Proyecto

```
Restaurant-Page-with_DB/
├── .github/                  # Templates de issues, PRs y workflows de CI
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
│       └── backend-ci.yml
├── docs/                     # Documentación técnica y funcional
│   ├── tablas/               # Documentación por tabla
│   ├── ERD.md
│   ├── API.md
│   └── decisiones.md
├── database/                 # Scripts SQL
│   ├── migrations/           # 0001 → 0007
│   ├── seeds/                # Clientes y reservaciones de prueba
│   ├── queries/              # Consultas reutilizables
│   └── tests/                # Tests de constraints y queries
├── backend/                  # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── utils/
│   ├── scripts/
│   └── tests/
├── frontend/                 # Interfaz de usuario (React + Vite)
│   └── src/
├── docker-compose.yml        # SQL Server 2022 en contenedor (opcional)
├── .editorconfig
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

---

## 📋 Requisitos Previos

- **Node.js** >= 18.x → [Descargar](https://nodejs.org/)
- **npm** >= 9.x (viene con Node)
- **SQL Server 2022** (Express) → [Descargar](https://www.microsoft.com/sql-server/sql-server-downloads)
- **Git** → [Descargar](https://git-scm.com/)
- **Docker Desktop** (opcional, para SQL Server en contenedor)

---

## 🚀 Instalación Paso a Paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/Javiersan237/Restaurant-Page-with_DB.git
cd Restaurant-Page-with_DB
git checkout develop
```

### 2. Instalar dependencias

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3. Configurar variables de entorno

**Backend** (`backend/.env`):
```bash
cd backend
cp .env.example .env
```

Edita `backend/.env` con tus credenciales reales de SQL Server:
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=1433
DB_NAME=ElyseeDB
DB_USER=sa
DB_PASSWORD=TuPasswordReal
DB_ENCRYPT=false
DB_TRUST_CERT=true
JWT_SECRET=cambia_esto_por_una_clave_larga
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=debug
```

**Frontend** (`frontend/.env.local`):
```bash
cd ../frontend
cp .env.example .env.local
```

Contenido:
```
VITE_API_URL=http://localhost:3000/api
```

### 4. Preparar la base de datos

**Opción A — SQL Server Express local (recomendado)**

1. Asegúrate de que el servicio `SQL Server (SQLEXPRESS)` esté corriendo.
2. Ejecuta las migraciones en orden (SSMS o sqlcmd):
   ```
   database/migrations/0001_DropAndCreateDatabase.sql
   database/migrations/0002_Create_Clientes.sql
   database/migrations/0003_Create_Mesas.sql
   database/migrations/0004_Create_Agendas.sql
   database/migrations/0005_Create_Reservaciones.sql
   database/migrations/0006_Create_Indexes.sql
   database/migrations/0007_Insert_DatosIniciales.sql
   ```
3. (Opcional) Carga los seeds:
   ```
   database/seeds/seed_clientes.sql
   database/seeds/seed_reservaciones.sql
   ```

**Opción B — SQL Server en Docker**

```bash
docker-compose up -d
```

Espera 30 segundos y verifica con `docker ps` que el contenedor esté `healthy`.

Luego ejecuta las migraciones como en la Opción A.

---

## ▶️ Cómo Ejecutar el Proyecto

Necesitas **2 terminales** (backend + frontend).

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
→ Disponible en `http://localhost:3000`
→ Health check: `http://localhost:3000/health`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
→ Disponible en `http://localhost:5173`

---

## 🔌 Endpoints de la API

Todos los endpoints están documentados en [`docs/API.md`](./docs/API.md).

| Método | Endpoint | Descripción |
|:------:|----------|-------------|
| GET | `/health` | Health check del backend |
| GET | `/api/mesas` | Lista todas las mesas (con filtros) |
| GET | `/api/mesas/:id` | Detalle de una mesa |
| GET | `/api/mesas/disponibles` | Mesas libres para un bloque horario |
| POST | `/api/clientes` | Crear o recuperar cliente por email |
| GET | `/api/clientes/:email` | Buscar cliente por email |
| POST | `/api/reservaciones` | Crear reservación (valida solapamiento) |
| GET | `/api/reservaciones/:id` | Detalle de una reservación |
| PATCH | `/api/reservaciones/:id/estado` | Cambiar estado de una reservación |

**Ejemplo rápido:**
```bash
curl http://localhost:3000/api/mesas
curl "http://localhost:3000/api/mesas/disponibles?fecha=2026-11-01&horaInicio=20:00&duracionMin=120&personas=4"
```

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [ERD](./docs/ERD.md) | Diagrama Entidad-Relación |
| [API](./docs/API.md) | Especificación de endpoints REST |
| [Tablas](./docs/tablas/) | Documentación de cada tabla |
| [Decisiones](./docs/decisiones.md) | Registro de decisiones técnicas (ADR) |
| [database/README](./database/README.md) | Instrucciones de migraciones, seeds y Docker |

---

## 🌿 Flujo de Ramas

| Rama | Propósito | Quién escribe |
|------|-----------|---------------|
| `main` | Solo archivos base del repo | Solo vía PR aprobado |
| `develop` | Rama de integración con todo el código | Ambos desarrolladores |
| `feature/*` | Trabajo individual por issue | Cada uno la suya |

**Reglas de contribución:**

1. Sincroniza `develop` antes de empezar un issue: `git pull origin develop`
2. Toda feature se desarrolla en una rama `feature/nombre-descriptivo`.
3. Se abre un Pull Request hacia `develop`.
4. El otro compañero revisa y aprueba.
5. `main` **nunca** recibe merges directos sin PR aprobado.

---

## 🧪 Tests

**Backend:**
```bash
cd backend
npm test          # Jest (con --passWithNoTests)
npm run lint      # ESLint
```

**Base de datos:**
Ejecutar en SSMS los scripts en `database/tests/`:
- `test_constraints.sql` — 12 tests de CHECK, FK, UNIQUE
- `test_queries.sql` — 6 tests de estructura y queries

**Frontend:**
```bash
cd frontend
npm test
```

---

## 🐳 SQL Server con Docker (opcional)

```bash
cd backend
npm run db:up     # levanta SQL Server 2022 en contenedor
npm run db:down   # detiene el contenedor
npm run db:logs   # ver logs en tiempo real
```

**Nota**: si ya tienes SQL Server Express corriendo en el puerto 1433, el contenedor también intentará usarlo y habrá conflicto. Detén el contenedor con `npm run db:down` o cambia el puerto en `docker-compose.yml`.

Ver [`database/README.md`](./database/README.md) para más detalles.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 👥 Autores

- **Javier Aram** — [@Javiersan237](https://github.com/Javiersan237)
- **Angela Sofía** — [@estrella18iortiz-byte](https://github.com/estrella18iortiz-byte)

---

## 🙏 Agradecimientos

Proyecto desarrollado como práctica profesional de arquitectura full-stack
con SQL Server, Node.js y React.