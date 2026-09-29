# 🤝 Guía de contribución — ÉLYSÉE Reservas

¡Gracias por querer contribuir al proyecto! Esta guía describe el flujo de trabajo que seguimos para mantener el código ordenado y de calidad.

---

## 🌳 Modelo de ramas

| Rama | Propósito | ¿Quién escribe? |
|------|-----------|-----------------|
| `main` | Producción estable · **PROTEGIDA** | Solo vía Pull Request |
| `develop` | Integración de features | Todo el equipo |

**Regla de oro:** **Nunca** se trabaja directamente en `main`.

---

## 🔄 Flujo de trabajo paso a paso

### 1. Actualizar `develop` localmente

Antes de empezar a trabajar, siempre trae los últimos cambios:

    git checkout develop
    git pull origin develop

### 2. Crear una rama para tu trabajo (opcional pero recomendado)

    git checkout -b feat/nombre-corto
    # o
    git checkout -b fix/nombre-del-bug

**Convención de nombres:**

- `feat/` → nueva funcionalidad
- `fix/` → corrección de bug
- `docs/` → documentación
- `chore/` → configuración, tareas menores
- `refactor/` → mejora de código sin cambiar funcionalidad

### 3. Hacer tus cambios y commitear

    git add .
    git commit -m "tipo(alcance): descripción corta"

**Convención de commits (Conventional Commits):**

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `style` | Formato, sin cambio lógico |
| `refactor` | Reestructurar código |
| `test` | Tests |
| `chore` | Tareas de mantenimiento |
| `db` | Cambios en la base de datos |

**Ejemplos:**

    feat(frontend): agregar página de menú
    fix(backend): validar email duplicado
    docs: actualizar API.md
    db: agregar índice en tabla Reservaciones

### 4. Subir tu rama a GitHub

    git push origin feat/nombre-corto

### 5. Crear un Pull Request

- Ve a GitHub → pestaña **Pull requests** → **New pull request**
- **base:** `develop`
- **compare:** tu rama
- Llena la plantilla que aparece automáticamente
- Pide review a alguien del equipo

### 6. Aprobación y merge

- Mínimo **1 aprobación** requerida
- Una vez aprobado, haz click en **Merge pull request**
- **Importante:** borra tu rama después del merge

---

## 📋 Tipos de issues

Cuando crees un issue, elige la plantilla correcta:

| Plantilla | Cuándo usarla |
|-----------|---------------|
| 🐛 Bug | Algo no funciona como debería |
| ✨ Feature | Nueva funcionalidad |
| 🗄️ DB Change | Cambios en tablas, índices o seeds |

---

## 🏷️ Labels

| Label | Significado |
|-------|-------------|
| `prioridad-alta` | Urgente, bloquea a otros |
| `prioridad-media` | Importante pero no urgente |
| `prioridad-baja` | Nice to have |
| `sprint-1` `sprint-2` `sprint-3` | Sprint asignado |
| `buena-primera-tarea` | Ideal para nuevos contribuidores |
| `frontend` / `backend` / `devops` | Área del proyecto |
| `docs` | Documentación |

---

## 🎨 Convenciones de código

### Frontend

- **Componentes:** PascalCase (`MiComponente.jsx`)
- **Hooks:** camelCase con prefijo `use` (`useDisponibilidad.js`)
- **Estilos:** Tailwind CSS, sin CSS modules
- **Idioma:** Comentarios y textos de UI en **español**

### Backend

- **Rutas:** kebab-case (`/api/reservaciones`)
- **Campos JSON:** camelCase (`numeroPersonas`)
- **Campos SQL:** PascalCase (`NumeroPersonas`)
- **Idioma:** Comentarios en **español**

### Base de datos

- **Tablas:** PascalCase plural (`Clientes`, `Mesas`)
- **Columnas:** PascalCase singular (`ClienteID`, `Nombre`)
- **Migraciones:** numeradas (`0001_...`, `0002_...`)

---

## ✅ Antes de pedir review de tu PR

- [ ] Mi código compila sin errores
- [ ] Pasé el linter (`npm run lint`)
- [ ] Probé los cambios en local
- [ ] Actualicé la documentación si aplica
- [ ] Vinculé el issue correspondiente (`Closes #XX`)
- [ ] Los commits tienen mensajes claros

---

## 🆘 ¿Dudas?

Abre un issue con la plantilla **✨ Feature** o pregunta en el chat del equipo.

**¡Gracias por contribuir a ÉLYSÉE!** 🍽️✨
