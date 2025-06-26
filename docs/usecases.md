# Casos de Uso Principales

A continuación se detallan las interacciones más importantes entre los actores y el sistema.

---

**ID:** `CU-01`

- **Nombre del Caso de Uso:** Administrador registra un nuevo asesino.
- **Actor(es):** Administrador ("La Orden").
- **Descripción:** Un administrador da de alta a un nuevo miembro en el registro, creando su perfil y credenciales iniciales.
- **Flujo Básico de Eventos:**
  1.  El administrador inicia sesión en el sistema.
  2.  Navega a la sección "Gestión de Miembros" y selecciona la opción "Añadir Nuevo Asesino".
  3.  El sistema presenta un formulario para ingresar los datos del nuevo miembro (Alias, Nombre Real, Habilidades, etc.).
  4.  El administrador completa el formulario y establece un estado inicial (ej. "Activo").
  5.  El sistema valida los datos, crea el nuevo perfil en la base de datos y genera unas credenciales temporales.
- **Post-condiciones:** El nuevo asesino existe en el sistema y puede iniciar sesión con las credenciales proporcionadas.

---

**ID:** `CU-02`

- **Nombre del Caso de Uso:** Asesino consulta su panel de control.
- **Actor(es):** Asesino.
- **Descripción:** El asesino accede a su página principal para revisar su estado actual, misiones, deudas y saldo.
- **Flujo Básico de Eventos:**
  1.  El asesino inicia sesión con sus credenciales.
  2.  El sistema lo redirige a su panel de control personal (`dashboard`).
  3.  La interfaz muestra un resumen de su perfil: Alias y Estado.
  4.  Se muestra su saldo actual de "Monedas de Oro".
  5.  Se presenta una lista de "Misiones Activas" con su estado actual.
  6.  Se presentan dos listas de "Marcadores de Sangre": una con las deudas que él tiene con otros y otra con las que otros tienen con él.
- **Post-condiciones:** El asesino tiene una visión clara y actualizada de su situación dentro de la Orden.

---

**ID:** `CU-03`

- **Nombre del Caso de Uso:** Administrador asigna un contrato.
- **Actor(es):** Administrador.
- **Descripción:** Un administrador asigna una misión existente a un asesino específico.
- **Flujo Básico de Eventos:**
  1.  El administrador inicia sesión y navega a la sección "Gestión de Contratos".
  2.  Busca y selecciona un contrato con estado "No Asignado".
  3.  Hace clic en la opción "Asignar".
  4.  El sistema le permite buscar y seleccionar a un asesino del registro que esté "Activo".
  5.  El administrador confirma la asignación.
  6.  El sistema actualiza el estado del contrato a "Asignado" y lo vincula al perfil del asesino.
  7.  El sistema envía una notificación al asesino sobre la nueva asignación.
- **Post-condiciones:** El contrato está oficialmente asignado y visible en el panel del asesino.

---

**ID:** `CU-04`

- **Nombre del Caso de Uso:** Asesino salda un marcador de sangre.
- **Actor(es):** Asesino (Deudor), Asesino (Acreedor).
- **Descripción:** Un asesino que debe un favor (deuda) realiza la acción para pagarlo y que el acreedor lo confirme, cerrando así el marcador.
- **Flujo Básico de Eventos:**
  1.  El asesino deudor inicia sesión y va a su lista de "Mis Deudas".
  2.  Selecciona el marcador que desea saldar y hace clic en "Pagar Marcador".
  3.  El sistema le solicita una confirmación.
  4.  Tras confirmar, el estado del marcador cambia a "Pago Pendiente de Confirmación".
  5.  El sistema notifica al asesino acreedor.
  6.  El acreedor inicia sesión, ve la notificación, y confirma que la deuda ha sido satisfecha.
  7.  El sistema actualiza el estado del marcador a "Saldado" y lo mueve al historial de ambos asesinos.
- **Post-condiciones:** La deuda queda oficialmente cerrada y registrada en el historial de ambos miembros.
