import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Catalogo from './Catalogo';
import { productosService } from './productos.service';

vi.mock('./productos.service', () => ({
    productosService: {
        getCategories: vi.fn(),
        getAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        bulkUpload: vi.fn()
    }
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

// Helper para llenar el formulario y no repetir código
const llenarFormulario = (container, overrides = {}) => {
    const data = {
        codigo_interno: 'PRN-100',
        id_categoria: '1',
        nombre_producto: 'Producto Válido',
        descripcion: 'Descripción válida',
        precio: '1000',
        stock: '5',
        ...overrides
    };
    
    if (data.codigo_interno !== null) fireEvent.change(screen.getByPlaceholderText('PRN-001'), { target: { value: data.codigo_interno } });
    if (data.id_categoria !== null) fireEvent.change(container.querySelector('select[name="id_categoria"]'), { target: { value: data.id_categoria } });
    if (data.nombre_producto !== null) fireEvent.change(container.querySelector('input[name="nombre_producto"]'), { target: { value: data.nombre_producto } });
    if (data.descripcion !== null) fireEvent.change(container.querySelector('textarea[name="descripcion"]'), { target: { value: data.descripcion } });
    if (data.precio !== null) fireEvent.change(container.querySelector('input[name="precio"]'), { target: { value: data.precio } });
    if (data.stock !== null) fireEvent.change(container.querySelector('input[name="stock"]'), { target: { value: data.stock } });
};

describe('Matriz de Casos de Prueba - Módulo Inventario', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('usuario', JSON.stringify({ id_rol: 1 }));
        productosService.getCategories.mockResolvedValue([{ id_categoria: 1, nombre_categoria: 'Categoría Prueba' }]);
        productosService.getAll.mockResolvedValue([]);
    });

    const abrirModalNuevoProducto = async () => {
        const { container } = renderWithRouter(<Catalogo />);
        await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());
        fireEvent.click(screen.getByText(/Nuevo Producto/i));
        expect(await screen.findByText('Guardar Producto')).toBeInTheDocument();
        return container;
    };

    // ---------------------------------------------------------
    // SECCIÓN 1: ÉXITO
    // ---------------------------------------------------------
    it('CP-001: Verificar el registro exitoso de un producto', async () => {
        productosService.create.mockResolvedValue({ success: true });
        const container = await abrirModalNuevoProducto();
        
        llenarFormulario(container);
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(productosService.create).toHaveBeenCalled());
        const callArgs = productosService.create.mock.calls[0][0]; // FormData
        expect(callArgs.get('codigo_interno')).toBe('PRN-100');
        expect(callArgs.get('nombre_producto')).toBe('Producto Válido');
    });

    // ---------------------------------------------------------
    // SECCIÓN 2: CÓDIGO INTERNO
    // ---------------------------------------------------------
    it('CP-002: Validar que el Código Interno sea obligatorio', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { codigo_interno: '' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/El código interno es obligatorio/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-003: Validar que el Código Interno no pueda estar compuesto únicamente por espacios', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { codigo_interno: '     ' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/El código interno es obligatorio/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-004: Validar que el Código Interno sea único', async () => {
        // Simulamos que el backend rechaza porque ya existe
        productosService.create.mockRejectedValue(new Error('El código ya existe'));
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { codigo_interno: 'DUPLICADO' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/El código ya existe/i)).toBeInTheDocument());
    });

    it('CP-005: Validar la longitud máxima permitida del Código Interno', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { codigo_interno: 'A'.repeat(100) }); // Suponiendo un máximo excedido
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/longitud máxima/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-006: Validar caracteres permitidos en el Código Interno', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { codigo_interno: '###@@' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/formato del código es inválido/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    // ---------------------------------------------------------
    // SECCIÓN 3: NOMBRE
    // ---------------------------------------------------------
    it('CP-007: Validar que el Nombre sea obligatorio', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { nombre_producto: '' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/nombre.*requerido/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-008: Validar que el Nombre no contenga únicamente espacios', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { nombre_producto: '    ' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/nombre.*requerido/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-009: Validar que el Nombre sea único', async () => {
        productosService.create.mockRejectedValue(new Error('El nombre ya está registrado'));
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container);
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/El nombre ya está registrado/i)).toBeInTheDocument());
    });

    it('CP-0010: Validar la longitud máxima del Nombre', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { nombre_producto: 'A'.repeat(200) });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/exceso de longitud/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-0010b: Validar que el Nombre rechace números', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { nombre_producto: 'Producto 123' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/El nombre del producto no puede contener números/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-0010c: Validar que el Nombre rechace caracteres especiales', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { nombre_producto: 'Producto@#$' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/El nombre del producto no permite caracteres especiales/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    // ---------------------------------------------------------
    // SECCIÓN 4: DESCRIPCIÓN
    // ---------------------------------------------------------
    it('CP-0011: Verificar el registro con descripción válida', async () => {
        productosService.create.mockResolvedValue({ success: true });
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { descripcion: 'Descripción totalmente válida' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(productosService.create).toHaveBeenCalled());
    });

    it('CP-0012: Verificar el comportamiento cuando la descripción está vacía', async () => {
        productosService.create.mockResolvedValue({ success: true });
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { descripcion: '' }); // Opción vacía
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(productosService.create).toHaveBeenCalled()); // Debe pasar si es opcional
    });

    it('CP-0013: Validar la longitud máxima de la descripción', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { descripcion: 'A'.repeat(1000) });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/número máximo de caracteres/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    // ---------------------------------------------------------
    // SECCIÓN 5: PRECIO
    // ---------------------------------------------------------
    it('CP-0014: Validar que el Precio sea obligatorio', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { precio: '' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/precio.*requerido/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-0015: Validar que el Precio sea mayor que cero', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { precio: '0' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/mayor a cero/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-0016: Validar que el Precio no sea negativo', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { precio: '-50' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/rechaza el registro/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-0017: Validar que el Precio solo acepte números (input number nativo lo hace, probamos con texto si lo permitiera)', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { precio: 'letras' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/formato es inválido|requerido/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-0018: Validar que el Precio no acepte caracteres especiales', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { precio: '$4500' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        // Normalmente el DOM no permite tipear $ en input type="number", por lo que el valor queda vacío.
        await waitFor(() => expect(screen.getByText(/requerido/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-0019: Validar el Precio con el valor mínimo permitido (1)', async () => {
        productosService.create.mockResolvedValue({ success: true });
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { precio: '1' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(productosService.create).toHaveBeenCalled());
    });

    // ---------------------------------------------------------
    // SECCIÓN 6: STOCK
    // ---------------------------------------------------------
    it('CP-0020: Validar que el Stock sea obligatorio', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { stock: '' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/stock es obligatorio/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-0021: Validar que el Stock no sea negativo', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { stock: '-10' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/no puede ser negativo/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-0022: Validar que el Stock solo acepte números', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { stock: 'texto' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(screen.getByText(/rechaza|obligatorio/i)).toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-0023: Validar el Stock con el valor mínimo permitido (0)', async () => {
        productosService.create.mockResolvedValue({ success: true });
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { stock: '0' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(productosService.create).toHaveBeenCalled());
    });

    // ---------------------------------------------------------
    // SECCIÓN 7: COMPORTAMIENTOS DEL SISTEMA Y UI
    // ---------------------------------------------------------
    it('CP-0025: Verificar que solo un Administrador pueda registrar productos', async () => {
        // Simulamos usuario no admin
        localStorage.setItem('usuario', JSON.stringify({ id_rol: 2 }));
        const { container } = renderWithRouter(<Catalogo />);
        await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());
        
        // El botón "Nuevo Producto" no debería existir para usuarios no administradores
        expect(screen.queryByText(/Nuevo Producto/i)).not.toBeInTheDocument();
    });

    it('CP-0026: Verificar la generación del movimiento inicial de inventario', async () => {
        // En el frontend comprobamos que el valor del stock viaja al backend
        productosService.create.mockResolvedValue({ success: true });
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container, { stock: '50' });
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => {
            expect(productosService.create).toHaveBeenCalled();
            const formDataEnviado = productosService.create.mock.calls[0][0];
            expect(formDataEnviado.get('stock')).toBe('50');
        });
    });

    it('CP-0027: Verificar el registro en auditoría', async () => {
        // La auditoría la realiza el backend usando el token, el frontend asegura la llamada al endpoint
        productosService.create.mockResolvedValue({ success: true });
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container);
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => {
            expect(productosService.create).toHaveBeenCalled();
        });
    });

    it('CP-0031: Verificar el tiempo de respuesta del registro', async () => {
        // Simulamos respuesta rápida del backend (500ms)
        productosService.create.mockImplementation(() => 
            new Promise(resolve => setTimeout(() => resolve({ success: true }), 500))
        );
        
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container);
        
        const startTime = Date.now();
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        // Verifica el botón de guardando
        expect(screen.getByText(/Guardando/i)).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText(/Producto creado/i)).toBeInTheDocument();
        });
        
        const endTime = Date.now();
        expect(endTime - startTime).toBeLessThan(2000);
    });

    it('CP-0028: Verificar que el formulario se limpie después del registro exitoso', async () => {
        productosService.create.mockResolvedValue({ success: true });
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container);
        fireEvent.click(screen.getByText('Guardar Producto'));
        
        await waitFor(() => expect(productosService.create).toHaveBeenCalled());
        
        // El modal debería desaparecer
        await waitFor(() => expect(screen.queryByText('Guardar Producto')).not.toBeInTheDocument());
        
        // Al abrirlo de nuevo, debería estar vacío
        fireEvent.click(screen.getByText(/Nuevo Producto/i));
        
        // Esta aserción verificará que los valores estén en cero/vacíos
        const inputNuevo = container.querySelector('input[name="nombre_producto"]');
        expect(inputNuevo.value).toBe('');
    });

    it('CP-0029: Verificar el funcionamiento del botón Cancelar', async () => {
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container);
        
        fireEvent.click(screen.getByText('Cancelar'));
        
        // El modal debe desaparecer y no debe llamar a create
        await waitFor(() => expect(screen.queryByText('Guardar Producto')).not.toBeInTheDocument());
        expect(productosService.create).not.toHaveBeenCalled();
    });

    it('CP-0030: Verificar que un doble clic en Guardar no genere registros duplicados', async () => {
        productosService.create.mockResolvedValue({ success: true });
        const container = await abrirModalNuevoProducto();
        llenarFormulario(container);
        
        const btnGuardar = screen.getByText('Guardar Producto');
        fireEvent.click(btnGuardar);
        fireEvent.click(btnGuardar); // Doble clic
        
        // Solo debe llamarse 1 vez porque el botón se deshabilita
        await waitFor(() => expect(productosService.create).toHaveBeenCalledTimes(1));
    });
});
