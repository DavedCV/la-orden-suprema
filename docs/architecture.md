# Arquitectura del Frontend

A continuación se presenta un diagrama y una descripción de la arquitectura del frontend de la aplicación.

## Diagrama de Arquitectura

![Diagrama de Arquitectura](architecture.puml)

## Estructura de Directorios

La aplicación sigue una arquitectura de "feature-sliced" (características segmentadas), lo que ayuda a organizar el código de una manera modular y escalable.

-   `src/features`: Contiene los distintos módulos o características de la aplicación. Cada feature encapsula su propia lógica, componentes, hooks y tipos.
    -   `auth`: Autenticación y perfil de usuario.
    -   `assassins`: Gestión de asesinos.
    -   `dashboard`: Panel principal de la aplicación.
    -   `missions`: Gestión de misiones.
    -   `reports`: Generación de reportes.
    -   `blood-markers`: Gestión de contratos (marcadores de sangre).

-   `src/shared`: Contiene código que es reutilizado a través de múltiples features.
    -   `components`: Componentes de UI genéricos y reutilizables (Botones, Inputs, etc.).
    -   `hooks`: Hooks de React reutilizables.
    -   `services`: Lógica para interactuar con APIs externas.
    -   `store`: Manejo de estado global (Zustand).
    -   `types`: Definiciones de tipos de TypeScript compartidas.
    -   `utils`: Funciones de utilidad.

-   `src/pages`: Componentes que representan las páginas completas de la aplicación. Usualmente componen varios componentes de `features` para construir una vista.

-   `src/main.tsx`: El punto de entrada de la aplicación React.
