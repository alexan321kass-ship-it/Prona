describe('Módulo de Reportes: Historial de Ventas (E2E)', () => {

  const mockHistorial = {
    ventas: [
      {
        id_venta: 1,
        fecha: "2024-01-01T10:00:00Z", // Antigua
        cliente: "Juan Perez",
        identificacion: "123456",
        producto: "Producto Antiguo",
        cantidad: 1,
        total: 100,
        estado_venta: "Completada"
      },
      {
        id_venta: 2,
        fecha: "2024-01-05T10:00:00Z", // Nueva
        cliente: "Maria Gomez",
        identificacion: "789012",
        producto: "Producto Nuevo",
        cantidad: 2,
        total: 200,
        estado_venta: "Cancelada"
      }
    ]
  };

  const setupMock = () => {
    cy.window().then((win) => {
      win.localStorage.setItem('usuario', JSON.stringify({
        id_rol: 1, // Admin
        id_usuario: 99
      }));
    });

    // Interceptar todas las métricas que carga ReporteBasico para evitar llamadas reales
    cy.intercept('GET', '**/reportes/historial', { statusCode: 200, body: mockHistorial }).as('getHistorial');
    cy.intercept('GET', '**/reportes/mas-vendido', { statusCode: 200, body: { totales: [] } }).as('getMasVendido');
    cy.intercept('GET', '**/reportes/cliente-frecuente', { statusCode: 200, body: { clientes: [] } }).as('getClientes');
    cy.intercept('GET', '**/reportes/resumen', { statusCode: 200, body: {} }).as('getResumen');
    cy.intercept('GET', '**/reportes/mensual', { statusCode: 200, body: [] }).as('getMensual');
    cy.intercept('GET', '**/reportes/metricas-grales', { statusCode: 200, body: {} }).as('getMetricas');
  };

  it('Verificar carga inicial y renderizado del historial (CP-010-001 / 006 / 010)', () => {
    setupMock();
    cy.visit('/ReporteBasico?tab=historial');
    
    // Esperar a que resuelva la promesa principal
    cy.wait('@getHistorial');

    // Verificar datos
    cy.contains('Juan Perez').should('exist');
    cy.contains('123456').should('exist');
    cy.contains('Producto Antiguo').should('exist');
    
    // Validar inmutabilidad del formato de moneda
    cy.contains('$ 100').should('exist'); // Asumiendo formato es-CO de Intl.NumberFormat
  });

  it('Validar orden cronológico inverso del historial (CP-010-002)', () => {
    setupMock();
    cy.visit('/ReporteBasico?tab=historial');
    cy.wait('@getHistorial');

    // Extraemos las filas de la tabla (tbody > tr)
    cy.get('tbody tr').should('have.length', 2).then(($rows) => {
      // El primero debe ser Maria Gomez (porque es del 5 de Enero y Juan es del 1)
      cy.wrap($rows[0]).contains('Maria Gomez');
      cy.wrap($rows[1]).contains('Juan Perez');
    });
  });

  it('Buscar un cliente o producto específico (CP-010-003)', () => {
    setupMock();
    cy.visit('/ReporteBasico?tab=historial');
    cy.wait('@getHistorial');

    // Escribir en el buscador
    cy.get('input[placeholder*="Buscar por cliente"]').type('Juan');

    // Juan Perez debería ser visible y Maria Gomez no
    cy.contains('Juan Perez').should('be.visible');
    cy.contains('Maria Gomez').should('not.exist');
  });

  it('Intentar consultar el historial sin haber iniciado sesión (CP-010-004)', () => {
    // Visitamos sin setupMock (sin localStorage)
    cy.visit('/ReporteBasico?tab=historial');

    // Debería expulsarnos
    cy.url().should('include', '/login');
  });

  it('Consultar con historial vacío (CP-010-005)', () => {
    setupMock();
    
    // Sobrescribimos el mock solo para esta prueba
    cy.intercept('GET', '**/reportes/historial', {
      statusCode: 200,
      body: { ventas: [] }
    }).as('getHistorialVacio');

    cy.visit('/ReporteBasico?tab=historial');
    cy.wait('@getHistorialVacio');

    cy.contains('No se encontraron resultados').should('be.visible');
  });

  it('Validar límite de filas visibles en el historial (CP-010-007)', () => {
    setupMock();
    
    // Generar 55 ventas
    const granHistorial = Array.from({ length: 55 }, (_, i) => ({
      id_venta: i + 100,
      fecha: new Date().toISOString(),
      cliente: `Cliente ${i}`,
      identificacion: "000",
      producto: "Prod",
      cantidad: 1,
      total: 10,
      estado_venta: "Completada"
    }));

    cy.intercept('GET', '**/reportes/historial', {
      statusCode: 200,
      body: { ventas: granHistorial }
    }).as('getHistorialPaginado');

    cy.visit('/ReporteBasico?tab=historial');
    cy.wait('@getHistorialPaginado');

    // Deberían mostrarse solo 50 por defecto en pantalla
    cy.get('tbody tr').should('have.length', 50);

    // Debe mostrar la etiqueta indicando la paginación
    cy.contains('Mostrando 1–50').should('exist');
  });

  it('Validar visualización de venta anulada/cancelada (CP-RF010.1-008 y 009)', () => {
    setupMock();
    cy.visit('/ReporteBasico?tab=historial');
    cy.wait('@getHistorial');

    cy.get('tbody tr').then(($rows) => {
      // El primero es Maria (Cancelada)
      cy.wrap($rows[0]).contains('Cancelada');
      // No debería haber un botón "Devolver" para ella (si es que existe en el dom)
      cy.wrap($rows[0]).contains('button', 'Devolver').should('not.exist');
    });
  });

});
