# Show & Tell

Show & Tell es un reproductor minimalista para presentar contenido educativo curado como una secuencia de eventos. Cada evento combina medios y contenido editorial con contexto semántico y temporal. Las sesiones seleccionan y ordenan eventos para una presentación; no tienen que incluir todo el catálogo.

El proyecto está en fase de definición de producto y arquitectura. Este repositorio contiene documentación: todavía no hay aplicación ni scaffold.

## Alcance inicial

La primera experiencia funcional prevista contempla:

- Un dashboard con el listado de sesiones disponibles.
- La entrada a una sesión en modo de reproducción fullscreen.
- Una composición wireframe en bloques grises para validar estructura, sin definir todavía la dirección visual.
- Persistencia local en PostgreSQL, ejecutada con Docker.
- Contenido multimedia organizado inicialmente en el filesystem y sincronizado con la base de datos.

La edición de sesiones y contenido queda fuera del primer alcance de reproducción.

## Stack definido

| Área | Decisión |
| --- | --- |
| Frontend | React y TypeScript, con Vite |
| Backend | Python y FastAPI |
| Estilos | CSS Modules y tokens de diseño centralizados |
| Componentes | Componentes propios; primitivas accesibles sin estilo, como Radix, solo cuando sean útiles |
| Persistencia | PostgreSQL local con Docker |
| ORM, migraciones y contrato API | Pendientes de decisión |

Storybook y las herramientas de pruebas de componentes se consideran opciones para el desarrollo, pero su incorporación se decidirá al concretar el scaffold. No se ha aprobado una biblioteca visual con una estética prefabricada.

## Documentación

- [PRD.md](./PRD.md): visión, usuarios, alcance, requisitos iniciales y decisiones pendientes.

## Forma de trabajo

El proyecto avanzará de manera incremental y con revisión del usuario. Antes de implementar una función, crear el scaffold o introducir una dependencia, se consultará y se esperará aprobación explícita. Las decisiones aún no confirmadas se mantendrán abiertas en la documentación.
