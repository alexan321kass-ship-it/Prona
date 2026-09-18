describe('Módulo de Reportes: Anulación y Devolución de Ventas (E2E)', () => {

  const mockHistorial = {
    ventas: [
      {
        id_venta: 1,
        fecha: new Date().toISOString(), // Venta reciente (< 24h)
        cliente: "Juan Perez",
        identificacion: "123456",
        producto: "Producto A",
        cantidad: 2,
        total: 100,
        estado_venta: "Completada"
      },
      {
        id_venta: 2,
        fecha: new Date(Date.now() - (48 * 60 * 60 * 1000)).toISOString(), // Venta antigua (> 24h)
        cliente: "Maria Gomez",
        identificacion: "789012",
        producto: "Producto B",
        cantidad: 1,
        total: 50,
        estado_venta: "Completada"
      },
      {
        id_venta: 3,
        fecha: new Date().toISOString(),
        cliente: "Pedro Ruiz",
        identificacion: "111222",
        producto: "Producto C",
        cantidad: 3,
        total: 300,
        estado_venta: "Completada"
      },
      {
        id_venta: 4,
        fecha: new Date().toISOString(),
        cliente: "Laura Diaz",
        identificacion: "333444",
        producto: "Producto D",
        cantidad: 1,
        total: 20,
        estado_venta: "Cancelada" // Ya anulada
      }
    ]
  };

  const setupMock = (rol = 1) => {
    cy.window().then((win) => {
      win.localStorage.setItem('usuario', JSON.stringify({
        id_rol: rol, // 1 Admin, 2 Asesor
        id_usuario: 99
      }));
    });

    // Mock API responses
    cy.intercept('GET', '**/reportes/historial', { statusCode: 200, body: mockHistorial }).as('getHistorial');
    cy.intercept('GET', '**/reportes/mas-vendido', { statusCode: 200, body: { totales: [] } });
    cy.intercept('GET', '**/reportes/cliente-frecuente', { statusCode: 200, body: { clientes: [] } });
    cy.intercept('GET', '**/reportes/resumen', { statusCode: 200, body: {} });
    cy.intercept('GET', '**/reportes/mensual', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/reportes/metricas-grales', { statusCode: 200, body: {} });
    
    // Intercept API devoluciones
    cy.intercept('POST', '**/ventas/*/devolucion', { statusCode: 200, body: { success: true } }).as('postDevolucion');
  };

  it('Validar que el sistema impida anular una venta después de 24 horas (CP-RF007.4-05)', () => {
    setupMock(1);
    cy.visit('/ReporteBasico?tab=historial');
    cy.wait('@getHistorial');

    // Buscar a Maria Gomez y comprobar su botón Devolver
    cy.contains('td', 'Maria Gomez').parent().within(() => {
      cy.contains('button', 'Devolver')
        .should('exist') // El botón existe pero disabled
        .and('be.disabled')
        .and('have.attr', 'title', 'El tiempo límite para anular ha expirado (24h)');
    });
  });

  it('Verificar que un usuario con rol Asesor no tenga permisos para anular ventas (CP-RF007.4-04)', () => {
    setupMock(2); // Rol 2 = Asesor
    cy.visit('/ReporteBasico?tab=historial');
    
    // Al ser Asesor, la RutaProtegida bloquea el acceso a ReporteBasico (rol 1) y expulsa a /login (o a /).
    // Verificamos que no podamos ver el historial.
    cy.url().should('include', '/login');
  });

  it('Validar la anulación lógica exitosa de una venta reciente y múltiple (CP-RF007.4-01 y 06)', () => {
    setupMock(1);
    cy.visit('/ReporteBasico?tab=historial');
    cy.wait('@getHistorial');

    // Buscamos a Pedro Ruiz (Venta 3, reciente) y clickeamos Devolver
    cy.contains('td', 'Pedro Ruiz').parent().within(() => {
      cy.contains('button', 'Devolver').should('not.be.disabled').click();
    });

    // Aparece el modal
    cy.contains('Anular Venta #3').should('be.visible');

    // Justificar motivo
    cy.get('textarea[placeholder*="Justifique el motivo"]').type('Devolución múltiple');

    // Confirmar
    cy.contains('button', 'Confirmar Anulación').click();

    // Verificamos que la API recibe el payload correcto
    cy.wait('@postDevolucion').its('request').should((req) => {
      expect(req.url).to.include('/ventas/3/devolucion');
      expect(req.body).to.deep.equal({ motivo: 'Devolución múltiple' });
    });
  });

  it('Validar que el sistema impida anular una venta sin justificación (CP-RF007.4-02)', () => {
    setupMock(1);
    cy.visit('/ReporteBasico?tab=historial');
    cy.wait('@getHistorial');

    cy.contains('td', 'Juan Perez').parent().within(() => {
      cy.contains('button', 'Devolver').should('not.be.disabled').click();
    });

    cy.contains('Anular Venta #1').should('be.visible');

    // NO escribimos motivo y le damos a confirmar
    cy.contains('button', 'Confirmar Anulación').click();

    // Debería salir el error
    cy.contains('El motivo de anulación es obligatorio (FE-02)').should('be.visible');
  });

  it('Validar estado visual y no permitir doble anulación (CP-RF007.4-03 y 07)', () => {
    setupMock(1);
    cy.visit('/ReporteBasico?tab=historial');
    cy.wait('@getHistorial');

    // Laura Diaz es la venta Cancelada (Venta 4)
    cy.contains('td', 'Laura Diaz').parent().within(() => {
      // Debe verse el badge de Cancelada/Anulada
      cy.contains('Cancelada').should('exist');
      // NO debe tener botón Devolver
      cy.contains('button', 'Devolver').should('not.exist');
    });
  });

});
