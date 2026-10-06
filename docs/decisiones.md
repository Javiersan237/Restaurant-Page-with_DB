# 📐 Registro de Decisiones Técnicas (ADR)

Este documento registra las decisiones de arquitectura tomadas durante
el desarrollo del proyecto **ÉLYSÉE Reservas**, siguiendo el formato
[ADR de Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

## Índice

- [ADR-001: Uso de 3 tablas en lugar de 4](#adr-001-uso-de-3-tablas-en-lugar-de-4)
- [ADR-002: Validación de doble reservación en backend](#adr-002-validación-de-doble-reservación-en-backend)
- [ADR-003: ON DELETE CASCADE en Clientes → Reservaciones](#adr-003-on-delete-cascade-en-clientes--reservaciones)
- [ADR-004: Estado de reservación como atributo con CHECK](#adr-004-estado-de-reservación-como-atributo-con-check)
- [ADR-005: Elección de stack tecnológico](#adr-005-elección-de-stack-tecnológico)
- [ADR-006: Adopción de tabla Agendas (modelo 3 → 4 tablas)](#adr-006-adopción-de-tabla-agendas-modelo-3--4-tablas)
- [ADR-007: Sistema de autenticación con JWT](#adr-007-sistema-de-autenticación-con-jwt)

---

## ADR-001: Uso de 3 tablas en lugar de 4

**Fecha**: 2026-09-27
**Estado**: Aceptada
**Decisor**: Equipo de desarrollo

### Contexto

El diseño inicial contemplaba 4 tablas: `Clientes`, `Mesas`, `Reservaciones`
y `EstadosReservacion` (catálogo). La tabla catálogo permitiría agregar
estados nuevos sin modificar el esquema.

Sin embargo, los estados de una reservación son solo 5 valores estables
que cambian muy raramente: `Pendiente`, `Confirmada`, `Cancelada`,
`Completada`, `NoShow`. Y cada consulta de reservaciones tendría que hacer
un JOIN adicional para obtener el nombre del estado.

### Decisión

Usar **3 tablas** y almacenar el estado como un atributo `NVARCHAR(20)`
en la tabla `Reservaciones`, con un `CHECK CONSTRAINT` que valide los
valores permitidos.

### Justificación

- **Solo 5 estados estables**: la normalización estricta (3FN) está pensada
  para evitar redundancia, pero con un catálogo de 5 valores el ahorro es
  insignificante.
- **Menos JOINs**: cada consulta de reservaciones se simplifica al no tener
  que hacer JOIN con la tabla catálogo.
- **Misma integridad**: el `CHECK CONSTRAINT` garantiza que solo se puedan
  insertar los valores permitidos, igual que una FK.
- **Menos código**: menos tablas = menos modelos, menos servicios, menos
  validaciones en backend.
- **Mantenibilidad**: agregar un estado nuevo requiere un `ALTER TABLE`,
  lo cual es un evento raro y controlado.

### Consecuencias

**Positivas:**
- Consultas más simples y rápidas.
- Menos código en backend y frontend.
- Documentación más concisa.

**Negativas:**
- No se pueden agregar metadatos a los estados (color, descripción,
  permisos, orden de visualización). Si en el futuro se necesitan, habrá
  que migrar a tabla catálogo.
- Cambiar los valores permitidos requiere modificar el constraint
  (`ALTER TABLE ... DROP CONSTRAINT ... ADD CONSTRAINT`).

### Alternativas consideradas

1. **Tabla catálogo `EstadosReservacion`**: descartada por overhead
   innecesario para 5 valores estables.
2. **Enum de SQL Server**: no existe como tal; los `CHECK` son la forma
   estándar.

---

## ADR-002: Validación de doble reservación en backend

**Fecha**: 2026-09-27
**Estado**: Aceptada
**Decisor**: Equipo de desarrollo

### Contexto

Un usuario podría intentar reservar la misma mesa en la misma fecha y hora
dos veces, ya sea por error, por doble clic, o por dos usuarios distintos
compitiendo por la misma mesa. Necesitamos prevenir esta situación.

Las opciones eran:

1. **Constraint a nivel de BD** (`UNIQUE INDEX` filtrado).
2. **Validación en backend** con transacción y `UPDLOCK`.
3. **Validación en frontend** únicamente.

### Decisión

Validar en el **backend** con una transacción que use `UPDLOCK` y `HOLDLOCK`
para bloquear la fila durante la verificación de disponibilidad, y luego
insertar la reservación si está libre.

```sql
BEGIN TRANSACTION;
    IF EXISTS (
        SELECT 1 FROM Reservaciones WITH (UPDLOCK, HOLDLOCK)
        WHERE MesaID = @MesaID
          AND Fecha  = @Fecha
          AND Hora   = @Hora
          AND Estado IN ('Pendiente','Confirmada')
    )
    BEGIN
        ROLLBACK;
        THROW 50001, 'La mesa ya está reservada en ese horario.', 1;
    END

    INSERT INTO Reservaciones (...) VALUES (...);
COMMIT;
```

### Justificación

- **Cubre solapamientos de duración**: un `UNIQUE INDEX` solo previene
  duplicados exactos (misma mesa + misma hora exacta). Pero si una reservación
  dura 2 horas, un usuario podría reservar a las 20:00 y otro a las 21:00 en
  la misma mesa, generando conflicto real. La validación en backend puede
  considerar la ventana de ±1h o la duración completa.
- **Flexibilidad de negocio**: permite sobrescribir con confirmación (por
  ejemplo, para clientes VIP o emergencias), cosa que un constraint rígido
  no permite.
- **Mejor manejo de errores**: el backend puede devolver un mensaje claro
  al frontend (`409 Conflict`) en lugar de un error genérico de BD.
- **`UNIQUE INDEX` filtrado da falsa seguridad**: parece que protege, pero
  no cubre solapamientos de duración, lo cual es peor que no tenerlo.

### Consecuencias

**Positivas:**
- Cubre solapamientos reales.
- Mensajes de error claros y localizables.
- Lógica de negocio flexible y testeable.

**Negativas:**
- La integridad depende del backend, no de la BD. Si alguien inserta
  directamente con SQL, podría saltarse la validación.
- Requiere tests de concurrencia para verificar que `UPDLOCK` funciona.

### Alternativas consideradas

1. **`UNIQUE INDEX` filtrado**:
   ```sql
   CREATE UNIQUE INDEX UX_Reservaciones_Mesa_FechaHora
       ON Reservaciones(MesaID, Fecha, Hora)
       WHERE Estado IN ('Pendiente','Confirmada');
   ```
   Descartado por no cubrir solapamientos de duración.

2. **Validación solo en frontend**: descartado porque es trivialmente
   sorteable (basta con deshabilitar JS).

3. **Ambos (BD + backend)**: considerado, pero el `UNIQUE INDEX` daría
   falsa sensación de seguridad y complicaría el manejo de errores sin
   aportar valor real.

---

## ADR-003: ON DELETE CASCADE en Clientes → Reservaciones

**Fecha**: 2026-09-27
**Estado**: Aceptada
**Decisor**: Equipo de desarrollo

### Contexto

Si se borra un cliente de la tabla `Clientes`, ¿qué debe pasar con sus
reservaciones asociadas en la tabla `Reservaciones`?

Opciones:

1. **`ON DELETE CASCADE`**: borrar las reservaciones automáticamente.
2. **`ON DELETE NO ACTION`**: impedir borrar el cliente si tiene reservaciones.
3. **`ON DELETE SET NULL`**: dejar las reservaciones huérfanas (requiere
   que `ClienteID` sea nullable).

### Decisión

Usar **`ON DELETE CASCADE`** en la foreign key de `Clientes` hacia
`Reservaciones`.

```sql
CONSTRAINT FK_Reservaciones_Clientes
    FOREIGN KEY (ClienteID) REFERENCES Clientes(ClienteID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
```

### Justificación

- **Un cliente borrado no debe tener reservaciones activas**: si se borra
  un cliente (por GDPR, por solicitud del usuario, por limpieza de datos),
  dejar reservaciones huérfanas no tiene sentido funcional.
- **Cumplimiento normativo**: facilita el derecho al olvido (GDPR, Ley
  Federal de Protección de Datos en México).
- **Simplicidad**: no requiere lógica adicional en backend para limpiar
  reservaciones antes de borrar el cliente.
- **Consistencia referencial**: garantizada por la BD.

### Consecuencias

**Positivas:**
- Borrar un cliente limpia automáticamente toda su historia.
- No hay reservaciones huérfanas posibles.
- Menos lógica de negocio en backend.

**Negativas:**
- Se pierde el histórico de reservaciones si se borra un cliente. Esto
  puede ser problemático si el restaurante necesita reportes históricos
  que incluyan clientes ya borrados.
- No hay "soft delete": una vez borrado, no hay vuelta atrás.

### Mitigaciones

- Para auditoría estricta, la práctica recomendada es usar **soft delete**:
  agregar una columna `Activo BIT DEFAULT 1` y filtrar por ella en lugar
  de borrar físicamente.
- Como mitigación inmediata, se recomienda **no borrar clientes** en
  producción; solo marcarlos como inactivos si es necesario.

### Alternativas consideradas

1. **`ON DELETE NO ACTION`**: obliga al backend a borrar manualmente las
   reservaciones antes del cliente. Es más explícito pero más código.

2. **`ON DELETE SET NULL`**: dejaría reservaciones sin cliente, lo cual
   rompe la lógica de negocio (¿de quién es esa reservación?).

3. **Soft delete**: considerado para el futuro, pero se decidió no
   implementarlo en la versión inicial por simplicidad.

---

## ADR-004: Estado de reservación como atributo con CHECK

**Fecha**: 2026-09-27
**Estado**: Aceptada
**Decisor**: Equipo de desarrollo

### Contexto

Relacionado con ADR-001. El estado de una reservación puede ser uno de
5 valores: `Pendiente`, `Confirmada`, `Cancelada`, `Completada`, `NoShow`.

¿Cómo garantizar que solo se inserten valores válidos?

Opciones:

1. **Tabla catálogo + FK**.
2. **`CHECK CONSTRAINT`** con lista de valores permitidos.
3. **Tipo `ENUM`** (no existe nativamente en SQL Server).
4. **Validación solo en backend**.

### Decisión

Usar **`CHECK CONSTRAINT`** en la columna `Estado`:

```sql
CONSTRAINT CK_Reservaciones_Estado CHECK (
    Estado IN ('Pendiente','Confirmada','Cancelada','Completada','NoShow')
)
```

### Justificación

- **Integridad a nivel de BD**: aunque el backend valide, el constraint
  garantiza que incluso una inserción directa por SQL respete los valores.
- **Sin JOINs**: las consultas no necesitan un JOIN adicional para
  obtener el nombre del estado.
- **Rendimiento**: los CHECK son verificados en tiempo de inserción y no
  afectan consultas posteriores.
- **Simplicidad**: un solo constraint en lugar de una tabla + FK + JOINs.

### Consecuencias

**Positivas:**
- Consultas simples y rápidas.
- Integridad garantizada por la BD.
- Menos código.

**Negativas:**
- Agregar un estado nuevo requiere modificar el constraint:
  ```sql
  ALTER TABLE Reservaciones DROP CONSTRAINT CK_Reservaciones_Estado;
  ALTER TABLE Reservaciones ADD CONSTRAINT CK_Reservaciones_Estado CHECK (
      Estado IN ('Pendiente','Confirmada','Cancelada','Completada','NoShow','Reprogramada')
  );
  ```
- No se pueden agregar metadatos por estado (color, descripción, orden).

### Notas

Si en el futuro los estados crecen a más de 10 o necesitan metadatos
(color en UI, permisos por rol, orden de visualización), se migrará a
tabla catálogo. Se puede empezar con el CHECK y migrar sin romper
contratos de API.

---

## ADR-005: Elección de stack tecnológico

**Fecha**: 2026-09-27
**Estado**: Aceptada
**Decisor**: Equipo de desarrollo

### Contexto

Necesitamos elegir el stack para el backend, base de datos y frontend del
proyecto. Los criterios son:

- Curva de aprendizaje accesible para un equipo de 2 personas.
- Compatibilidad con SQL Server (requisito del proyecto).
- Buenas prácticas profesionales (testing, linting, CI/CD).
- Rendimiento adecuado para un restaurante de tamaño medio.
- Costo cero en desarrollo.

### Decisión

| Capa | Tecnología | Versión mínima |
|------|-----------|----------------|
| Backend | Node.js + Express | Node 18.x |
| Base de datos | SQL Server | 2019+ |
| Frontend | React + Vite | React 18 |
| Estilos | Tailwind CSS | 3.x |
| Cliente HTTP | Axios | 1.x |
| Routing | React Router DOM | 6.x |
| Autenticación | JWT + bcrypt | — |
| Linting | ESLint + Prettier | — |
| Testing backend | Jest + Supertest | — |
| CI/CD | GitHub Actions | — |
| Control de versiones | Git + GitHub | — |

### Justificación

**Backend: Node.js + Express**
- Curva de aprendizaje baja para el equipo.
- Gran ecosistema de librerías.
- Integración natural con `mssql` (driver oficial de Microsoft).
- Fácil de desplegar en servicios gratuitos (Railway, Render).

**Base de datos: SQL Server**
- Requisito explícito del proyecto (práctica profesional).
- Robusto, transaccional, con soporte para `UPDLOCK`, `CHECK`, FK.
- Herramientas maduras (SSMS, Azure Data Studio).

**Frontend: React + Vite**
- React es el estándar de la industria.
- Vite reemplaza a Create React App con builds mucho más rápidos.
- Ecosistema enorme de componentes y hooks.

**Estilos: Tailwind CSS**
- Estilizado rápido sin escribir CSS manual.
- Consistencia visual mediante tokens.
- Ideal para diseño responsive.

**Autenticación: JWT + bcrypt**
- JWT: estándar para APIs stateless.
- bcrypt: hash seguro de contraseñas con salt automático.

**Testing: Jest + Supertest**
- Jest es el estándar para Node.js.
- Supertest permite testear endpoints HTTP de forma natural.

**CI/CD: GitHub Actions**
- Integrado con GitHub (donde vive el repo).
- Gratis para repositorios públicos y con minutos generosos para privados.
- Configuración declarativa en YAML.

### Consecuencias

**Positivas:**
- Stack moderno, demandado en el mercado laboral.
- Documentación abundante y comunidad activa.
- Costo cero en desarrollo y bajo en producción.
- Fácil de mantener a largo plazo.

**Negativas:**
- Dos lenguajes en el proyecto (JavaScript backend y frontend).
- Node.js no es tan rápido como Go o Rust para cargas muy altas
  (irrelevante para un restaurante).
- SQL Server es propietario; migrar a PostgreSQL sería un esfuerzo si
  se quisiera cambiar en el futuro.

### Alternativas consideradas

1. **Backend en .NET**: descartado por curva de aprendizaje más alta.
2. **Backend en Python (FastAPI)**: viable, pero Node.js permite
   compartir lenguaje con el frontend.
3. **Frontend en Next.js**: considerado, pero Vite + React SPA es
   suficiente para este caso (no necesitamos SSR).
4. **Frontend en Vue**: viable, pero el equipo ya conoce React.
5. **Base de datos PostgreSQL**: descartado porque SQL Server es el
   requisito académico/profesional del proyecto.

---

## ADR-006: Adopción de tabla Agendas (modelo 3 → 4 tablas)

**Fecha**: 2026-09-28
**Estado**: Aceptada
**Decisor**: Equipo de desarrollo

### Contexto

El modelo original de 3 tablas (`Clientes`, `Mesas`, `Reservaciones`) tenía
dos limitaciones:

1. **No había forma de agrupar reservaciones** por bloque de tiempo.
2. **La duración de reservación era fija** (asumida en 2 horas), sin
   flexibilidad para reservas cortas o largas.
3. **La validación de solapamiento** era implícita, basada en comparación de
   horas concretas, sin una entidad que representara el "bloque reservable".

El equipo solicitó agregar una tabla `Agendas` que representara bloques de
tiempo reservables, con duración variable (30–180 min).

### Decisión

Adoptar un **modelo de 4 tablas** con `Agendas` como tabla principal y
`Reservaciones` como tabla puente.

**Estructura**:

- `Clientes` (PK: `ClienteID`)
- `Mesas` (PK: `MesaID`)
- `Agendas` (PK: `AgendaID`)
- `Reservaciones` (PK: `ReservacionID`, FKs: `ClienteID`, `MesaID`, `AgendaID`)

**Reglas**:

- Relación: 1 Agenda → N Reservaciones
- Solapamiento: validado por **MESA**, no por agenda
- Duración: elegida por el cliente, máx 180 min
- Capacidad: 50 personas globales (suma de 13 mesas)
- Ciclo de vida: creación automática + eliminación lazy

### Justificación

- **Flexibilidad**: permite reservas de 30, 60, 90, 120, 150 o 180 minutos.
- **Validación precisa**: el solapamiento se calcula con intervalos exactos
  (`HoraInicio` y `HoraFin`), no con horas puntuales.
- **Sin redundancia**: `Fecha`, `HoraInicio`, `HoraFin` viven solo en
  `Agendas`, y cada reserva apunta a una agenda.
- **Escalabilidad**: si mañana se agrega un turno ("Comida", "Cena"), se puede
  extender `Agendas` con una columna `Turno` sin tocar `Reservaciones`.
- **Reportes**: se pueden agrupar reservas por bloque de tiempo con facilidad.

### Consecuencias

**Positivas**:

- Modelo más expresivo y flexible.
- Validación de solapamiento robusta.
- Mejor base para reportes por turno/bloque.

**Negativas**:

- Más complejidad en backend: hay que crear/buscar agendas antes de insertar.
- Requiere una tabla más y una FK más.
- Migración de las 4 migraciones existentes (renumeración).

### Alternativas consideradas

1. **Sin tabla Agendas**: descartada porque la duración fija de 2 horas
   era demasiado rígida.
2. **Agenda como tabla de solo lectura (pre-creada)**: descartada porque
   requiere panel de admin y no escala bien.
3. **Agenda con duración fija de 3 horas**: considerada pero descartada
   porque no refleja la realidad de reservas cortas.

---

## ADR-007: Sistema de autenticación con JWT

**Fecha**: 2026-10-06
**Estado**: Aceptada
**Decisor**: Equipo de desarrollo

### Contexto

Necesitábamos agregar autenticación al sistema para:

1. Permitir a los clientes ver y gestionar sus reservaciones desde un panel personal.
2. Crear un panel administrativo con acceso restringido para el personal.
3. Vincular reservaciones a cuentas de usuario (en lugar de crear un cliente nuevo por cada reserva).

### Decisión

Implementar autenticación con:

- **JWT** (algoritmo HS256, expiración de 24h) para sesiones sin estado.
- **bcrypt** (10 rounds) para hashear contraseñas.
- **Tablas separadas**: `Clientes` (con campos de auth) y `Usuarios` (para admins/staff).
- **Dos roles**: `cliente` y `admin`/`staff`.
- **Middlewares** de Express: `verificarToken` y `requireRole`.

### Justificación

**JWT simple (sin refresh tokens)**:

- Adecuado para la escala del proyecto.
- Sin complejidad de rotación de tokens.
- El cliente re-loguea al expirar (24h).

**bcrypt**:

- Estándar de facto para hash de contraseñas.
- Incluye salt automático.
- Resistente a ataques de fuerza bruta por su factor de costo.

**Tablas separadas** (`Clientes` + `Usuarios`):

- Los clientes y admins tienen diferentes campos y flujos.
- Más limpio que una tabla única con discriminador.
- Más seguro: un admin comprometido no puede ver datos de clientes por accidente.

### Consecuencias

**Positivas:**

- API stateless (escalable horizontalmente).
- Seguridad basada en estándares de la industria.
- Separación clara entre clientes y personal.
- Los clientes pueden ver y gestionar sus reservaciones.
- Los admins tienen un panel dedicado.

**Negativas:**

- JWT no se puede invalidar antes de su expiración (24h).
- Requiere rotación del `JWT_SECRET` si se filtra.
- Necesita HTTPS en producción obligatoriamente.

### Alternativas consideradas

1. **Session cookies + Redis**: descartado por requerir infraestructura extra.
2. **OAuth2 con Google**: descartado por sobre-ingeniería para el alcance.
3. **Una sola tabla con discriminador `tipo`**: descartado por mezclar dominios.
4. **JWT + refresh tokens**: descartado por complejidad innecesaria.
5. **Solo auth de admin**: descartado porque los clientes necesitan ver sus reservas.

---

## Cómo agregar un nuevo ADR

1. Copiar la plantilla de la sección "Plantilla" abajo.
2. Asignar el siguiente número secuencial (`ADR-008`, `ADR-009`, etc.).
3. Rellenar Contexto, Decisión, Justificación y Consecuencias.
4. Agregar al índice al inicio del documento.
5. Hacer commit con mensaje `docs: agregar ADR-XXX <título>`.

## Plantilla

```markdown
## ADR-XXX: <Título corto y descriptivo>

**Fecha**: YYYY-MM-DD
**Estado**: Propuesta | Aceptada | Rechazada | Obsoleta | Reemplazada por ADR-YYY
**Decisor**: <quién o quiénes>

### Contexto

<Qué situación nos llevó a tomar esta decisión>

### Decisión

<Qué decidimos hacer>

### Justificación

<Por qué esta opción y no las alternativas>

### Consecuencias

**Positivas:**
- ...

**Negativas:**
- ...

### Alternativas consideradas

1. **<Alternativa A>**: <por qué se descartó>
2. **<Alternativa B>**: <por qué se descartó>
```