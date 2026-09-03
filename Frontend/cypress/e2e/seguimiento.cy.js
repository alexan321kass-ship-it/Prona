describe('Flujo E2E de Seguimiento de Pedidos', () => {

  const mockPedidoValido = {
    id_pedido: 101,
    nombre_cliente: "Juan Perez", 
    identificacion: "123456",
    fecha_pedido: "2024-01-01T10:00:00Z",
    estado_pedido: "En proceso",
    total: 50000
  };

  const setupMock = (rol = 1) => {
    cy.window().then((win) => {
      win.localStorage.setItem('usuario', JSON.stringify({
        id_rol: rol,
        id_usuario: 99,
        primer_nombre: "Admin"
      }));
    });
  };

  beforeEach(() => {
    // Mock inicial de la API
    cy.intercept('GET', '**/pedidos?limite=100', {
      statusCode: 200,
      body: { pedidos: [mockPedidoValido] }
    }).as('getPedidos');

    cy.intercept('GET', '**/seguimiento/sugerencias', {
      statusCode: 200,
      body: ["101 - Juan Perez"]
    }).as('getSugerencias');
  });

  it('Verificar la consulta exitosa y renderizado inicial (CP-RF009.1-01)', () => {
    setupMock();
    cy.visit('/seguimiento');
    cy.wait('@getPedidos');
    cy.contains('Juan Perez').should('be.visible');
    cy.contains('En proceso').should('be.visible');
  });

  it('Verificar que no se permita consulta vacía (ID obligatorio) (CP-RF009.1-02)', () => {
    setupMock();
    cy.visit('/seguimiento');
    cy.wait('@getPedidos');

    // Hacemos una búsqueda vacía
    cy.get('input[placeholder="Buscar por cliente o # de pedido..."]').clear().type('   ');
    cy.contains('button', 'Buscar').click();

    // Validar visualmente el error
    cy.contains('El ID del pedido es obligatorio').should('be.visible');
  });

  it('Verificar la consulta de un pedido inexistente (CP-RF009.1-03)', () => {
    setupMock();
    cy.visit('/seguimiento');
    cy.wait('@getPedidos');

    // Interceptar la búsqueda fallida
    cy.intercept('GET', '**/seguimiento/buscar?query=999', {
      statusCode: 200,
      body: []
    }).as('buscarInexistente');

    cy.get('input[placeholder="Buscar por cliente o # de pedido..."]').clear().type('999');
    cy.contains('button', 'Buscar').click();

    cy.wait('@buscarInexistente');
    cy.contains('El pedido no fue encontrado').should('be.visible');
  });

  it('Verificar visualización de estado dinámico (Entregado) (CP-RF009.1-07)', () => {
    setupMock();
    cy.visit('/seguimiento');
    cy.wait('@getPedidos');
    
    cy.contains('En proceso').should('be.visible');

    // Interceptamos la búsqueda para que ahora devuelva Entregado
    cy.intercept('GET', '**/seguimiento/buscar?query=101', {
      statusCode: 200,
      body: [{ ...mockPedidoValido, estado_pedido: 'Entregado' }]
    }).as('buscarActualizado');

    cy.get('input[placeholder="Buscar por cliente o # de pedido..."]').clear().type('101');
    cy.contains('button', 'Buscar').click();

    cy.wait('@buscarActualizado');
    cy.contains('Entregado').should('be.visible');
    cy.contains('En proceso').should('not.exist');
  });

  it('Verificar redirección de seguridad sin rol autorizado (CP-RF009.1-06)', () => {
    // Si rol=99 no está permitido
    setupMock(99);
    cy.visit('/seguimiento');
    
    // Ruta protegida debe mandar al login (o donde determine App.jsx)
    cy.url().should('include', '/login');
  });

});
