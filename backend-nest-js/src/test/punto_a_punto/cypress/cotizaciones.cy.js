describe('Flujo de Cotizaciones y Validaciones (E2E)', () => {
  
  beforeEach(() => {
    // Establecer estado de autenticación en localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('usuario', JSON.stringify({
        id_usuario: 1,
        id_rol: 2, // Rol asesor o compatible
        primer_nombre: "Asesor"
      }));

      // Evitar que window.open devuelva null y rompa el test
      cy.on('window:before:load', (win) => {
        cy.stub(win, 'open').returns({
          document: { write: () => {}, close: () => {} },
          print: () => {}
        }).as('windowOpen');
      });
    });

    // Mocks de la API para que carguen los productos y clientes
    cy.intercept('GET', '**/productos', {
      statusCode: 200,
      body: {
        productos: [
          { id_producto: 1, codigo_interno: 'P-01', nombre_producto: 'Producto Activo', precio: 1000, stock: 10, nombre_categoria: 'Cat', estado_producto: 'Activo' },
          { id_producto: 2, codigo_interno: 'P-02', nombre_producto: 'Producto Inactivo', precio: 2000, stock: 0, nombre_categoria: 'Cat', estado_producto: 'Inactivo' }
        ]
      }
    }).as('getProductos');

    cy.intercept('GET', '**/clientes', {
      statusCode: 200,
      body: {
        clientes: [
          { id_cliente: 1, identificacion: '123456', nombre_cliente: 'Cliente Activo', estado_cliente: 'Activo' },
          { id_cliente: 2, identificacion: '987654', nombre_cliente: 'Cliente Inactivo', estado_cliente: 'Inactivo' }
        ]
      }
    }).as('getClientes');

    cy.intercept('POST', '**/cotizaciones', {
      statusCode: 200,
      body: { success: true, message: "Cotización creada" }
    }).as('postCotizacion');

    // Visitar la página de nueva cotización (Pedidos)
    cy.visit('/Pedidos');
  });

  it('Verificar que solo se puedan seleccionar clientes y productos activos (CP-07 y CP-08)', () => {
    cy.wait('@getProductos');
    
    // Verificamos el grid de productos
    cy.contains('Producto Activo').should('exist');
    cy.contains('Producto Inactivo').should('not.exist'); // No debería aparecer en la UI

    // Buscar cliente inactivo
    cy.wait('@getClientes');
    cy.get('input[placeholder="Buscar por nombre o identificación..."]').type('Inactivo');
    cy.contains('Cliente Inactivo').should('not.exist');
    
    // Buscar cliente activo
    cy.get('input[placeholder="Buscar por nombre o identificación..."]').clear().type('Activo');
    cy.contains('Cliente Activo').should('exist');
  });

  it('Verificar que no sea posible registrar una cotización sin seleccionar un cliente (CP-02)', () => {
    cy.wait('@getProductos');
    // Agregar producto al carrito sin seleccionar cliente
    cy.contains('button', 'Añadir').click({ force: true });
    
    // Intentar cotizar
    cy.contains('button', 'Generar Cotización').click({ force: true });

    // Validar mensaje
    cy.contains('Selecciona un cliente primero').should('be.visible');
  });

  it('Verificar que no sea posible registrar una cotización sin productos (CP-03)', () => {
    cy.wait('@getClientes');
    // Seleccionar cliente
    cy.get('input[placeholder="Buscar por nombre o identificación..."]').type('Activo');
    cy.contains('Cliente Activo').should('exist').click({ force: true });

    // Carrito está vacío, la UI debería no tener el botón o decir que está vacío
    cy.contains('button', 'Generar Cotización').should('not.exist');
    cy.contains('Tu carrito está vacío').should('exist');
  });

  it('Verificar que el sistema muestra un mensaje indicando que el descuento excede el límite permitido (CP-04)', () => {
    cy.wait('@getProductos');
    cy.wait('@getClientes');
    
    // Seleccionar cliente y producto
    cy.get('input[placeholder="Buscar por nombre o identificación..."]').type('Activo');
    cy.contains('Cliente Activo').should('exist').click({ force: true });
    cy.contains('button', 'Añadir').click({ force: true });

    // Poner descuento 25%
    cy.get('input[type="number"]').first().clear().type('25', { force: true });

    // Intentar generar
    cy.contains('button', 'Generar Cotización').click({ force: true });
    cy.contains('El descuento excede el límite permitido').should('be.visible');
  });

  it('Verificar que la vigencia de la cotización sea válida (CP-05)', () => {
    cy.wait('@getProductos');
    cy.wait('@getClientes');
    
    // Seleccionar cliente y producto
    cy.get('input[placeholder="Buscar por nombre o identificación..."]').type('Activo');
    cy.contains('Cliente Activo').should('exist').click({ force: true });
    cy.contains('button', 'Añadir').click({ force: true });

    // Poner fecha del pasado
    cy.get('input[type="date"]').type('2020-01-01', { force: true });

    // Intentar generar
    cy.contains('button', 'Generar Cotización').click({ force: true });
    cy.contains('La vigencia es inválida').should('be.visible');
  });

  it('Verificar que el sistema calcula correctamente totales con descuento (CP-06)', () => {
    cy.wait('@getProductos');
    cy.wait('@getClientes');
    
    cy.contains('button', 'Añadir').click({ force: true });

    // Poner descuento 10%
    cy.get('input[type="number"]').first().clear().type('10', { force: true });

    // Validar visualmente el texto del bloque de descuento
    cy.contains('Descuento (10%)').should('be.visible');
    
    // Comprobamos visualmente que se inyecta la fila de descuento y Total
    cy.contains('Total Final').should('be.visible');
  });

  it('Verificar el registro exitoso de una cotización con datos válidos (CP-01)', () => {
    cy.wait('@getProductos');
    cy.wait('@getClientes');
    
    cy.get('input[placeholder="Buscar por nombre o identificación..."]').type('Activo');
    cy.contains('Cliente Activo').should('exist').click({ force: true });
    cy.contains('button', 'Añadir').click({ force: true });

    // Descuento válido 15%
    cy.get('input[type="number"]').first().clear().type('15', { force: true });

    // Fecha futura
    cy.get('input[type="date"]').type('2050-12-31', { force: true });

    cy.contains('button', 'Generar Cotización').click({ force: true });

    // Asertar la llamada a la API
    cy.wait('@postCotizacion').its('request.body').should((body) => {
      expect(body).to.have.property('id_cliente', 1);
      expect(body).to.have.property('descuento', 15);
      expect(body.detalles).to.have.length(1);
    });

    cy.contains('Cotización generada correctamente').should('be.visible');
  });

});
