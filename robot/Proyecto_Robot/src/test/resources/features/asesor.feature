# language: es
Característica: Flujos del Asesor de Ventas
  Como asesor de ventas de Pronavid
  Quiero gestionar clientes, crear pedidos y generar cotizaciones
  Para atender a mis clientes de manera eficiente
  # ══════════════════════════════════════════════
  # ESCENARIOS DE GESTIÓN DE CLIENTES (CRUD)
  # Usa "Cliente CRUD Robot" — se crea y se elimina al final
  # ══════════════════════════════════════════════

  Escenario: Crear un nuevo cliente para el CRUD
    Dado que "el asesor" está en la página de gestión de clientes
    Cuando el asesor crea un nuevo cliente llamado "Cliente CRUD Robot" con identificacion "999888777", telefono "3001234567", correo "testcrud@mail.com" y direccion "Calle Falsa 123"
    Entonces el sistema deberia mostrar al cliente "Cliente CRUD Robot" en la tabla

  Escenario: Buscar el cliente creado con la barra de búsqueda
    Dado que "el asesor" está en la página de gestión de clientes
    Cuando el asesor busca al cliente "Cliente CRUD Robot" en la barra de búsqueda
    Entonces el sistema deberia mostrar al cliente "Cliente CRUD Robot" en la tabla

  Escenario: Editar el teléfono del cliente
    Dado que "el asesor" está en la página de gestión de clientes
    Cuando el asesor edita el teléfono del cliente "Cliente CRUD Robot" a "3109876543"
    Entonces el sistema deberia mostrar al cliente "Cliente CRUD Robot" en la tabla

  Escenario: Eliminar el cliente de prueba CRUD
    Dado que "el asesor" está en la página de gestión de clientes
    Cuando el asesor elimina al cliente "Cliente CRUD Robot"
    Entonces el sistema ya no deberia mostrar al cliente "Cliente CRUD Robot" en la tabla
  # ══════════════════════════════════════════════
  # ESCENARIOS DE PEDIDO Y COTIZACIÓN
  # Usa "Cliente Pedido Robot" — se crea y NO se elimina
  # ══════════════════════════════════════════════

  Escenario: Crear un cliente para pedidos y cotizaciones
    Dado que "el asesor" está en la página de gestión de clientes
    Cuando el asesor crea un nuevo cliente llamado "Cliente Pedido Robot" con identificacion "111222333", telefono "3157654321", correo "testpedido@mail.com" y direccion "Av. Siempreviva 742"
    Entonces el sistema deberia mostrar al cliente "Cliente Pedido Robot" en la tabla

  Escenario: Crear un pedido para el cliente de pedidos
    Dado que "el asesor" está en la página de pedidos
    Cuando el asesor crea un pedido para el cliente "Cliente Pedido Robot" con el producto "Barra de Cereal Chocolate 25g"
    Entonces el sistema deberia confirmar que el pedido fue creado

  Escenario: Generar una cotización para el cliente de pedidos
    Dado que "el asesor" está en la página de pedidos
    Cuando el asesor genera una cotización para el cliente "Cliente Pedido Robot" con el producto "Barra de Cereal Fresa y Banano 25g"
    Entonces el sistema deberia confirmar que el pedido fue creado
