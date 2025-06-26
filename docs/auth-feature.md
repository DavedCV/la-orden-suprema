# Feature: Autenticación (Auth)

Este documento detalla la implementación de la característica de autenticación.

## Descripción

La característica de autenticación es responsable de manejar el inicio de sesión del usuario, la gestión de su perfil y los cambios de contraseña.

## Diagrama de Componentes

![Diagrama de Componentes de Autenticación](auth-feature.puml)

## Componentes

-   `LoginPage.tsx`: La página principal de inicio de sesión. Contiene el `LoginForm`.
-   `LoginForm.tsx`: El formulario que los usuarios utilizan para introducir sus credenciales. Maneja la lógica de envío y la comunicación con el hook `useAuth`.
-   `ProfilePage.tsx`: La página de perfil del usuario. Muestra la información del usuario y permite la edición. Compone `ProfileHeader`, `ProfileStats` y `ProfileForm`.
-   `ProfileHeader.tsx`: Muestra la información principal del perfil del usuario, como el nombre y la foto de perfil.
-   `ProfileStats.tsx`: Muestra estadísticas relevantes del usuario.
-   `ProfileForm.tsx`: Un formulario que permite a los usuarios editar la información de su perfil.
-   `FirstLoginModal.tsx`: Un modal que se muestra al usuario la primera vez que inicia sesión, generalmente para forzar un cambio de contraseña.
-   `PasswordChangeModal.tsx`: Un modal que permite al usuario cambiar su contraseña.
