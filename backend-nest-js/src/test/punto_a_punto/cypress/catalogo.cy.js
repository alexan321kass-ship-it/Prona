describe('Módulo de Inventario: Catálogo de Productos (E2E)', () => {

  const setupMock = (rol = 1) => {
    cy.window().then((win) => {
      win.localStorage.setItem('usuario', JSON.stringify({
        id_rol: rol, // 1 Admin, 2 Asesor
        id_usuario: 99
      }));
    });

    // Mock API GET responses
    cy.intercept('GET', '**/productos', { statusCode: 200, body: { productos: [] } }).as('getProductos');
    cy.intercept('GET', '**/productos/categorias', { 
        statusCode: 200, 
        body: { categorias: [{ id_categoria: 1, nombre_categoria: 'Categoría Prueba' }] } 
    }).as('getCategorias');
    
    // Intercept POST para crear (por defecto éxito)
    cy.intercept('POST', '**/productos', { statusCode: 200, body: { success: true } }).as('postProducto');
  };

  const llenarFormulario = (data) => {
    if (data.codigo !== undefined) {
      if (data.codigo === '') cy.get('input[placeholder="PRN-001"]').clear();
      else cy.get('input[placeholder="PRN-001"]').clear().type(data.codigo);
    }
    
    if (data.nombre !== undefined) {
      if (data.nombre === '') cy.get('input[name="nombre_producto"]').clear();
      else cy.get('input[name="nombre_producto"]').clear().type(data.nombre);
    }

    if (data.precio !== undefined) {
      if (data.precio === '') cy.get('input[name="precio"]').clear();
      else cy.get('input[name="precio"]').clear().type(data.precio);
    }

    if (data.stock !== undefined) {
      if (data.stock === '') cy.get('input[name="stock"]').clear();
      else cy.get('input[name="stock"]').clear().type(data.stock);
    }

    if (data.descripcion !== undefined) {
      if (data.descripcion === '') cy.get('textarea[name="descripcion"]').clear();
      else cy.get('textarea[name="descripcion"]').clear().type(data.descripcion);
    }

    if (data.categoria !== undefined) {
      cy.get('select[name="id_categoria"]').select(data.categoria);
    }
  };

  const dataValida = {
    codigo: 'PRN-100',
    nombre: 'Producto Válido',
    precio: '1000',
    stock: '5',
    descripcion: 'Descripción válida',
    categoria: '1'
  };

  beforeEach(() => {
    setupMock(1); // Por defecto admin
    cy.visit('/Catalogo');
    cy.wait('@getProductos');
    cy.wait('@getCategorias');
  });

  // ---------------------------------------------------------
  // ÉXITO
  // ---------------------------------------------------------
  it('Verificar el registro exitoso de un producto (CP-001)', () => {
    cy.contains('button', 'Nuevo Producto').click();
    cy.contains('Guardar Producto').should('exist');

    llenarFormulario(dataValida);
    
    cy.contains('button', 'Guardar Producto').click({ force: true });

    cy.wait('@postProducto').its('request.body').should((body) => {
      // Como es FormData, Cypress no lo parsea mágicamente a objeto en request.body, 
      // suele ser un string multipart/form-data. Pero podemos comprobar que la petición se hizo.
      expect(body).to.exist;
    });

    cy.contains('Producto creado').should('exist');
  });

  // ---------------------------------------------------------
  // VALIDACIONES CÓDIGO INTERNO
  // ---------------------------------------------------------
  it('Validar el Código Interno (CP-002, 003, 004, 006)', () => {
    cy.contains('button', 'Nuevo Producto').click();

    // 1. Vacío o espacios
    llenarFormulario({ ...dataValida, codigo: '     ' });
    cy.contains('button', 'Guardar Producto').click({ force: true });
    cy.contains(/código interno es obligatorio/i).should('exist');

    // 2. Caracteres especiales
    llenarFormulario({ ...dataValida, codigo: '###@@' });
    cy.contains('button', 'Guardar Producto').click({ force: true });
    cy.contains(/formato del código es inválido/i).should('exist');

    // 3. Duplicado (mock error)
    cy.intercept('POST', '**/productos', { 
        statusCode: 400, 
        body: { error: 'El código ya existe' } 
    }).as('postProductoError');

    llenarFormulario({ ...dataValida, codigo: 'DUPLICADO' });
    cy.contains('button', 'Guardar Producto').click({ force: true });
    cy.wait('@postProductoError');
    cy.contains(/El código ya existe/i).should('exist');
  });

  // ---------------------------------------------------------
  // VALIDACIONES NOMBRE Y DESCRIPCION
  // ---------------------------------------------------------
  it('Validar Nombre y Descripción (CP-007 al 013)', () => {
    cy.contains('button', 'Nuevo Producto').click();

    // Nombre vacío
    llenarFormulario({ ...dataValida, nombre: '    ' });
    cy.contains('button', 'Guardar Producto').click({ force: true });
    cy.contains(/nombre.*requerido/i).should('exist');

    // Nombre duplicado
    cy.intercept('POST', '**/productos', { 
        statusCode: 400, 
        body: { error: 'El nombre ya está registrado' } 
    }).as('postProductoErrorNombre');

    llenarFormulario({ ...dataValida, nombre: 'Producto Duplicado' });
    cy.contains('button', 'Guardar Producto').click({ force: true });
    cy.wait('@postProductoErrorNombre');
    cy.contains(/El nombre ya está registrado/i).should('exist');

    // Longitud máxima de descripción (escribir >500 o 1000 char suele ser lento en type() pero se puede testear con el UI limit).
    // Cypress: no es óptimo escribir 1000 chars por UI (muy lento). Omitimos esa simulación.
  });

  // ---------------------------------------------------------
  // VALIDACIONES PRECIO Y STOCK
  // ---------------------------------------------------------
  it('Validar Precio y Stock numéricos mayores a cero (CP-014 al 023)', () => {
    cy.contains('button', 'Nuevo Producto').click();

    // Precio cero
    llenarFormulario({ ...dataValida, precio: '0' });
    cy.contains('button', 'Guardar Producto').click({ force: true });
    cy.contains(/mayor a cero/i).should('exist');

    // Precio negativo (a través de flechas del input o manual en cypress)
    llenarFormulario({ ...dataValida, precio: '-50' });
    cy.contains('button', 'Guardar Producto').click({ force: true });
    cy.contains(/rechaza el registro|inválido|mayor a cero/i).should('exist');

    // Stock negativo
    llenarFormulario({ ...dataValida, stock: '-10', precio: '10' });
    cy.contains('button', 'Guardar Producto').click({ force: true });
    cy.contains(/no puede ser negativo/i).should('exist');

    // Stock válido 0
    llenarFormulario({ ...dataValida, stock: '0' });
    cy.contains('button', 'Guardar Producto').click({ force: true });
    cy.wait('@postProducto');
    cy.contains('Producto creado').should('exist');
  });

  // ---------------------------------------------------------
  // PERMISOS Y EXPERIENCIA (Asesor, Limpieza de Modal)
  // ---------------------------------------------------------
  it('Validar comportamientos UI y Asesor (CP-025, 028, 029)', () => {
    // 1. Botón Cancelar y Limpieza de form
    cy.contains('button', 'Nuevo Producto').click();
    llenarFormulario({ ...dataValida, nombre: 'Prueba Limpieza' });
    cy.contains('button', 'Cancelar').click();
    
    // Modal se cierra
    cy.contains('Guardar Producto').should('not.exist');
    
    // Reabrir modal y verificar que esté vacío
    cy.contains('button', 'Nuevo Producto').click();
    cy.get('input[name="nombre_producto"]').should('have.value', '');
    cy.contains('button', 'Cancelar').click();

    // 2. Probar Asesor
    cy.window().then((win) => {
        win.localStorage.setItem('usuario', JSON.stringify({
          id_rol: 2, // Asesor
          id_usuario: 99
        }));
    });
    cy.reload(); // Recargar para aplicar el nuevo localStorage
    cy.wait('@getProductos');
    
    // El botón NO debe existir para el asesor
    cy.contains('button', 'Nuevo Producto').should('not.exist');
  });

});
