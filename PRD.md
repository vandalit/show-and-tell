# PRD — Show & Tell

**Estado:** borrador inicial  
**Propósito:** fijar la visión y el alcance del producto antes de elaborar el SDD y construir el scaffold.

## 1. Visión del producto

Show & Tell es un reproductor de contenido educativo curado para presentar noticias, acontecimientos y referencias de forma expositiva. Una sesión reúne una selección ordenada de eventos que se pueden recorrer durante una clase. La experiencia prioriza el contenido, su contexto semántico y su posición temporal, sin exigir que el presentador recorra todo el catálogo.

El sistema tendrá dos modos de producto:

1. **Gestión:** mantener contenido, clasificación y sesiones.
2. **Reproducción:** presentar una sesión en una interfaz fullscreen.

El alcance inicial se enfoca en persistencia, clasificación representada en un dashboard y reproducción de sesiones. La edición de contenido y sesiones queda reservada para una etapa posterior.

## 2. Usuarios y necesidades

### Usuario principal

Una persona docente que prepara y presenta contenido educativo.

### Necesidades

- Seleccionar y ordenar un conjunto de eventos para una sesión.
- Presentar cada evento con una imagen o video, un titular y una bajada legibles.
- Mantener visible el contexto temático y temporal del evento.
- Acceder a información ampliada sin mostrarla por defecto.
- Administrar el contenido localmente con poca fricción y conservarlo de forma persistente.

## 3. Conceptos del dominio

- **Evento:** unidad de contenido con medios, texto editorial, clasificación y contexto temporal. Puede incluir titular, bajada, descripción y cuerpo. La descripción y el cuerpo estarán ocultos por defecto durante la reproducción.
- **Sesión:** selección ordenada de eventos que se presenta como una unidad. Puede reutilizar eventos de otras sesiones.
- **Taxonomía:** estructura configurable de conceptos y categorías para clasificar y explorar eventos. Puede tener niveles como categoría, subcategoría y concepto específico; no debe depender de una lista fija codificada en la interfaz.
- **Contexto temporal:** fechas o periodos asociados a un evento, representados como calendario para periodos contemporáneos o como línea temporal para referencias históricas.
- **Biblioteca local:** directorios de archivos multimedia y contenido asociados inicialmente a los eventos.

Estos conceptos describen el producto; no prescriben todavía un esquema de base de datos.

## 4. Alcance inicial

### Incluido

- Persistencia local con PostgreSQL, ejecutada mediante Docker.
- Un dashboard que muestre las sesiones disponibles.
- Navegación desde el dashboard a la reproducción de una sesión.
- Una vista de reproducción fullscreen, inicialmente como wireframe de bloques grises.
- Recorrido secuencial de los eventos de la sesión mediante controles anterior y siguiente.
- Presentación de imagen de portada, titular y bajada.
- Controles de reproducción y acceso a detalles ampliados.
- Contexto semántico en la esquina superior izquierda.
- Contexto temporal en la esquina superior derecha.
- Una franja inferior compacta para los controles de navegación, reproducción y acceso a detalles.
- Fechas y rangos de fechas asociados a los eventos, almacenados como datos y no como recursos gráficos específicos.
- Una estructura modular que mantenga los componentes de presentación separados de los datos que consumen.

### Fuera del alcance inicial

- Interfaz de edición de sesiones o eventos.
- Diseño visual final, identidad gráfica y selección de tipografía.
- Una taxonomía educativa definitiva.
- Editor visual de grafos o constructor de flujos de datos.
- Sincronización bidireccional avanzada o resolución automática de conflictos.
- Integraciones con modelos agénticos, MCP o proveedores externos.
- Abandono del filesystem como fuente inicial de medios.

## 5. Requisitos funcionales iniciales

### Sesiones y dashboard

- **RF-01:** el sistema debe presentar un listado de sesiones persistidas.
- **RF-02:** el usuario debe poder abrir una sesión para reproducirla.
- **RF-03:** la reproducción debe respetar el orden de eventos definido para esa sesión.
- **RF-04:** una sesión puede reutilizar eventos que aparezcan en otras sesiones.

### Reproducción

- **RF-05:** la sesión se presenta en una vista fullscreen.
- **RF-06:** cada evento muestra una imagen de portada como medio predeterminado, junto con un titular y una bajada.
- **RF-07:** el texto sobre la imagen debe conservar legibilidad; el tratamiento visual específico se definirá en la etapa de diseño.
- **RF-08:** los controles permiten ir al evento anterior o siguiente y activar la reproducción.
- **RF-09:** la interfaz ofrece acceso a detalles ampliados, ocultos por defecto.
- **RF-10:** cuando exista un video de fondo, su reproducción se activa explícitamente; no debe iniciarse automáticamente al mostrar el evento.
- **RF-11:** la zona superior presenta el contexto semántico a la izquierda y el contexto temporal a la derecha.
- **RF-12:** la representación temporal depende del contexto: calendario para periodos contemporáneos y línea temporal para referencias históricas.
- **RF-13:** un calendario puede representar rangos y destacar el periodo asociado al evento sin requerir una imagen de calendario independiente.

### Contenido, clasificación y persistencia

- **RF-14:** el contenido inicial puede organizarse en el filesystem, con recursos asociados a cada evento.
- **RF-15:** debe existir una operación de sincronización explícita que concilie el contenido del filesystem con la persistencia local.
- **RF-16:** la persistencia conserva el contenido y los datos estructurados necesarios para reproducir eventos y sesiones.
- **RF-17:** la clasificación debe poder evolucionar sin codificar una taxonomía cerrada en la interfaz.

## 6. Requisitos de arquitectura y experiencia

- Los componentes visuales deben poder evolucionar sin acoplarse al formato de almacenamiento.
- La lógica de presentación debe estar separada de los estilos y del contenido que alimenta cada componente.
- La interfaz debe poder construirse incrementalmente, comenzando por una composición de bloques grises.
- La dirección artística y los estilos deben poder cambiarse sin reescribir la lógica de reproducción.
- La solución debe ser local-first en su etapa inicial, con PostgreSQL en Docker y medios en un directorio local.
- Las futuras fuentes de contenido no deben quedar conceptualmente limitadas al filesystem.

## 7. Composición inicial de reproducción

La vista fullscreen se validará primero como wireframe de bloques grises, sin cerrar colores, tipografía ni estilo final:

1. **Área principal:** imagen de portada a ancho completo, con titular y bajada superpuestos. El tratamiento visual deberá mantener legibilidad.
2. **Franja superior:** contexto semántico a la izquierda y calendario o línea temporal a la derecha.
3. **Franja inferior compacta:** controles anterior, siguiente y play, más acceso a expansión y detalles.
4. **Contenido ampliado:** descripción y cuerpo disponibles bajo demanda, ocultos en el estado inicial.

La estructura define regiones y jerarquía, no una maqueta visual final ni las dimensiones exactas de cada componente.

## 8. Stack acordado

- **Frontend:** React y TypeScript, con Vite.
- **Backend:** Python y FastAPI.
- **Estilos:** CSS Modules y tokens de diseño centralizados.
- **Componentes:** componentes propios, utilizando primitivas accesibles sin estilo cuando aporten valor.
- **Persistencia:** PostgreSQL local, ejecutada con Docker.

El stack de lenguajes y frameworks queda definido como **Python + FastAPI + React + TypeScript**. Vite se conserva como herramienta de desarrollo y compilación del frontend, según la decisión previa. Radix es una opción de primitivas accesibles, no una dependencia confirmada. Storybook y las herramientas de pruebas de componentes siguen por decidir al diseñar el scaffold. También quedan pendientes el ORM, la estrategia de migraciones y el contrato de comunicación entre frontend y backend.

## 9. Evolución considerada, no comprometida para la primera versión

- Editor de sesiones y herramientas CMS para crear, reorganizar y reclasificar contenido.
- Taxonomía flexible con relaciones padre-hijo y posibles relaciones de grafo.
- Compatibilidad con convenciones de PKM y vaults de Obsidian, incluyendo tags.
- Línea temporal histórica con nodos y posibles ramificaciones.
- Configuración de repetición de videos, incluido el comportamiento de loop.
- API propia y conectores para fuentes de contenido o modelos agénticos.
- Posibilidad de poblar el producto directamente desde una interfaz o API, además del filesystem.

Estas ideas requieren definición y validación antes de incorporarse al alcance comprometido.

## 10. Criterios de aceptación del primer hito de producto

El primer hito de producto se considerará definido cuando:

1. Se pueda consultar el listado de sesiones persistidas desde el dashboard.
2. Se pueda abrir una sesión y recorrer sus eventos en orden.
3. La vista de reproducción muestre la composición fullscreen acordada, inicialmente con bloques grises.
4. Los medios, textos editoriales y contextos temporales de los eventos puedan representarse sin fijar una taxonomía visual inmutable.
5. Se haya acordado e implementado la persistencia local y la relación de reproducción entre sesiones y eventos.

Los detalles de sincronización, validación de archivos y comportamiento ante conflictos deberán especificarse en el SDD antes de implementarse.

## 11. Decisiones pendientes

- ORM, esquema de migraciones y límites de responsabilidad entre API y cliente.
- Contrato de comunicación entre frontend y backend.
- Formato, estructura y reglas de validación del contenido local.
- Comportamiento exacto de sincronización y resolución de conflictos o eliminaciones.
- Modelo de relaciones entre sesiones, eventos, categorías, etiquetas y periodos temporales.
- Reglas para mostrar calendario frente a línea temporal histórica.
- Comportamiento de final de sesión, autoplay y loop.
- Alcance y permisos del CMS futuro.
- Herramientas de desarrollo y pruebas que formarán parte del scaffold.

## 12. Proceso de decisión

Este PRD es una base inicial, no una autorización para implementar. Cada paso técnico y funcional se revisará con el usuario. Antes de implementar código, crear el scaffold o añadir dependencias, se debe solicitar aprobación explícita. Las decisiones confirmadas deben reflejarse en la documentación antes de pasar al siguiente paso.
