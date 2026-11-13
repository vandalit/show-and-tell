# Show & Tell

Show & Tell es un reproductor minimalista para presentar contenido educativo curado como una secuencia de eventos. Cada evento combina medios y contenido editorial con contexto semántico y temporal. Las sesiones seleccionan y ordenan eventos para una presentación; no tienen que incluir todo el catálogo.

El proyecto avanza por etapas, con una primera estructura funcional intencionalmente mínima: persistencia local, un shell compartido de navegación, vistas iniciales y un reproductor en wireframe.

## Alcance inicial

La primera experiencia funcional prevista contempla:

- Un dashboard de entrada con el listado de proyectos disponibles.
- Un sidebar compacto con accesos a Dashboard, Vault y Colecciones; Vault y Colecciones son por ahora vistas vacías, sin modelo de datos propio.
- Las vistas separan un encabezado reutilizable (breadcrumb, título y acciones) de su región de contenido.
- Ordenamiento de proyectos por nombre o cantidad de cursos; búsqueda y filtros quedan como controles visuales pendientes.
- Navegación desde un proyecto a sus cursos, y desde un curso a sus sesiones.
- La entrada a una sesión en modo de reproducción fullscreen.
- Una composición wireframe en bloques grises para validar estructura, sin definir todavía la dirección visual.
- Persistencia local en PostgreSQL, ejecutada con Docker.
- Contenido multimedia organizado inicialmente en el filesystem y sincronizado con la base de datos.

La edición de sesiones y contenido queda fuera del primer alcance de reproducción.

## Stack y herramientas

| Área | Decisión |
| --- | --- |
| Frontend | React y TypeScript, con Vite |
| Backend | Python y FastAPI |
| ORM y migraciones | SQLAlchemy 2 y Alembic |
| Estilos | CSS Modules y tokens de diseño centralizados |
| Routing | React Router |
| Persistencia | PostgreSQL local con Docker |
| Contrato API | REST/JSON bajo `/api` |

## Estructura de datos inicial

- Los proyectos contienen cursos; un curso pertenece a un proyecto y contiene sesiones ordenadas.
- Una sesión contiene hitos/eventos ordenados; cada hito contiene slides ordenados.
- Las categorías tienen jerarquía propia y se asignan a hitos.
- Las colecciones configurables y los medios del filesystem quedan fuera de esta primera estructura.

El seed incluye los proyectos **Desafío Latam** y **Adalid**. Desafío Latam contiene los cursos **IA para marketing** y **Marketing & automatizaciones**; este último contiene cuatro sesiones. La primera sesión tiene dos hitos con cuatro slides cada uno y las otras sesiones quedan vacías. Adalid no tiene cursos para probar el estado vacío. El contenido es demostrativo y debe completarse con fuentes verificadas antes de usarlo como material educativo.

## Desarrollo local

Requisitos: Python 3.12+, Node.js 20+ y Docker Compose.

1. Inicia PostgreSQL desde la raíz:

   ```sh
   docker-compose up -d db
   ```

2. Prepara y ejecuta la API:

   ```sh
   cd backend
   cp .env.example .env
   python -m venv .venv
   . .venv/bin/activate
   pip install -e .
   alembic upgrade head
   python -m app.seed
   uvicorn app.main:app --reload
   ```

3. En otra terminal, ejecuta el frontend:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

La API expone `GET /api/health`, `GET /api/projects`, `GET /api/projects/{id}`, `GET /api/courses/{id}` y `GET /api/sessions/{id}`. La navegación del frontend va de proyectos a cursos, sesiones y reproductor, con breadcrumbs en los niveles de detalle. El reproductor ocupa la ventana, usa un bloque gris en lugar de medios y permite navegar slides; el control Play está visible pero desactivado hasta definir el comportamiento de reproducción. No hay sincronización de archivos ni edición de contenido en esta etapa. Las credenciales de Compose son solo para desarrollo local.

## Documentación

- [PRD.md](./PRD.md): visión, usuarios, alcance, requisitos iniciales y decisiones pendientes.

## Forma de trabajo

El proyecto avanzará de manera incremental y con revisión del usuario. Antes de implementar una función, crear el scaffold o introducir una dependencia, se consultará y se esperará aprobación explícita. Las decisiones aún no confirmadas se mantendrán abiertas en la documentación.
