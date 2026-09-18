describe('Flujo de Autenticación (Login)', () => {
  beforeEach(() => {
    // Interceptar la llamada de login
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        user: { id_usuario: 1, id_rol: 1, primer_nombre: "Admin" },
        token: "fake-jwt-token"
      }
    }).as('loginRequest');
  });

  it('Debe renderizar la vista de login y mostrar error con credenciales vacías', () => {
    cy.visit('/login');
    cy.contains('Iniciar Sesión').should('be.visible');
    
    // Clic sin llenar datos
    cy.get('button[type="submit"]').click();
    
    // Validar mensaje de error
    cy.contains('El correo es requerido').should('be.visible');
  });

  it('Debe permitir autenticarse correctamente y redirigir al dashboard', () => {
    cy.visit('/login');
    
    // Llenar formulario
    cy.get('input[type="email"]').type('admin@correo.com');
    cy.get('input[type="password"]').type('123456');
    
    // Enviar
    cy.get('button[type="submit"]').click();
    
    // Verificar que la solicitud fue interceptada y enviada correctamente
    cy.wait('@loginRequest').its('request.body').should('deep.equal', {
      correo: 'admin@correo.com',
      contrasena: '123456'
    });

    // Validar SweetAlert o mensaje en pantalla
    cy.contains('¡Bienvenido, Admin!').should('be.visible');

    // Validar redirección al Dashboard (después de 1200ms por el setTimeout)
    cy.url({ timeout: 2000 }).should('include', '/DashboardAdmin');
    
    // Validar persistencia en localStorage
    cy.window().then((win) => {
      const user = JSON.parse(win.localStorage.getItem('usuario'));
      expect(user.primer_nombre).to.eq('Admin');
    });
  });
});
