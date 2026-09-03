# language: es
Característica: Gestion de Productos en el catalogo
  Como administrador del sistema
  Quiero poder crear, editar y eliminar productos
  Para mantener el inventario actualizado

  Antecedentes:
    Dado que "el administrador" se encuentra en la pantalla del catálogo de productos

  Escenario: Crear un producto nuevo
    Cuando el administrador crea un nuevo producto llamado "Producto Test Automatizado" con precio "15000", sku "TEST-001", stock "20" y descripcion "Producto creado por el robot"
    Entonces el sistema deberia mostrar el producto "Producto Test Automatizado" en la grilla

  Escenario: Buscar un producto con la barra de búsqueda
    Cuando el administrador busca el producto "Producto Test Automatizado" en la barra de búsqueda
    Entonces el sistema deberia mostrar el producto "Producto Test Automatizado" en la grilla

  Escenario: Editar un producto existente
    Cuando el administrador edita el precio del producto "Producto Test Automatizado" a "25000"
    Entonces el sistema deberia mostrar el producto "Producto Test Automatizado" en la grilla

  Escenario: Eliminar un producto
    Cuando el administrador elimina el producto "Producto Test Automatizado"
    Entonces el sistema ya no deberia mostrar el producto "Producto Test Automatizado" en la grilla
