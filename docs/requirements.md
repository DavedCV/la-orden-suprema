# 1. Levantamiento de Requisitos

A continuación se especifican los requisitos que definen el comportamiento y las características del sistema.

## 1.1. Requisitos Funcionales (RF)

Los requisitos funcionales describen las operaciones y funcionalidades que el sistema debe ser capaz de realizar.

**Módulo de Autenticación y Perfiles**

- **RF-01:** El sistema debe permitir el inicio de sesión de usuarios (asesinos y administradores) a través de credenciales únicas y seguras.
- **RF-02:** Los administradores ("La Orden") deben tener la capacidad de crear nuevos perfiles de asesinos. La creación de cuentas no es pública.
- **RF-03:** Cada asesino debe tener un perfil que contenga: Alias, Estado (Activo, Retirado, Excommunicado), última ubicación conocida, historial de misiones completadas, deudas pendientes y saldo de "Monedas de Oro".
- **RF-04:** Un asesino solo puede ver y editar partes limitadas de su propio perfil. La información crítica (como el estado) solo puede ser modificada por un administrador.
- **RF-05:** Los administradores pueden ver y modificar el perfil completo de cualquier asesino.

**Módulo de Misiones (Contratos)**

- **RF-06:** Los administradores pueden crear, asignar, actualizar el estado (Asignada, En Progreso, Completada, Fallida) y archivar misiones.
- **RF-07:** La creación de una misión debe incluir: nombre del objetivo, descripción, recompensa en "Monedas de Oro" y fecha límite.
- **RF-08:** Un asesino solo puede ver los detalles completos de las misiones que le han sido asignadas.
- **RF-09:** Al completarse una misión, la recompensa en monedas debe transferirse automáticamente del fondo de la Orden a la cuenta del asesino.

**Módulo de Deudas (Marcadores de Sangre)**

- **RF-10:** Un asesino debe poder iniciar una solicitud para registrar un "Marcador de Sangre" (deuda) hacia otro asesino.
- **RF-11:** El sistema debe registrar el deudor, el acreedor, la fecha y el estado (Pendiente, Saldado) del marcador.
- **RF-12:** El sistema debe proveer una función para que un deudor marque una deuda como "pagada", lo que enviará una notificación al acreedor para su confirmación.
- **RF-13:** Un marcador solo se considerará "Saldado" cuando el acreedor confirme el pago del favor.

**Módulo de Directorio y Ubicación**

- **RF-14:** Los asesinos deben tener acceso a un directorio para buscar a otros miembros por su alias.
- **RF-15:** La información mostrada en el directorio será limitada: Alias, Estado y si existe un marcador entre el buscador y el buscado. No se mostrará la ubicación precisa.
- **RF-16:** Los administradores tendrán acceso a un mapa global que muestre la última ubicación conocida de todos los asesinos activos.

## 1.2. Requisitos No Funcionales (RNF)

Los requisitos no funcionales describen los atributos de calidad y las restricciones del sistema.

- **RNF-01 (Seguridad):** Toda la comunicación entre el cliente y el servidor debe estar cifrada mediante SSL/TLS (HTTPS). Las contraseñas deben ser hasheadas y salteadas. El acceso a los datos debe estar estrictamente gobernado por roles (RBAC).
- **RNF-02 (Performance):** Los tiempos de carga de la página no deben exceder los 3 segundos. Las consultas a la base de datos, especialmente las búsquedas y filtros, deben estar optimizadas para una respuesta rápida.
- **RNF-03 (Usabilidad):** La interfaz de usuario debe ser intuitiva, limpia y seguir una estética oscura (`dark mode`) y minimalista, consistente con la temática del universo John Wick.
- **RNF-04 (Confidencialidad):** El diseño de la base de datos y la API debe asegurar que un usuario no pueda acceder a información para la cual no tiene autorización explícita bajo ninguna circunstancia.
