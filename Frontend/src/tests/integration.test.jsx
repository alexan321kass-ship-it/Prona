import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Import Components
import RutaProtegida from '../compartido/components/RutaProtegida';
import SalesHistory from '../features/reportes/components/SalesHistory';
import Pedidos from '../features/pedidos/Pedidos';
import Login from '../features/autenticacion/Login';
import Catalogo from '../features/productos/Catalogo';

// Import APIs to mock
import { ventasService } from '../features/ventas/ventas.service';
import api from '../config/api';

vi.mock('../features/ventas/ventas.service', () => ({
    ventasService: {
        crearDevolucion: vi.fn()
    }
}));

vi.mock('../config/api', () => {
    const apiMock = {
        get: vi.fn(),
        post: vi.fn()
    };
    return {
        __esModule: true,
        default: apiMock,
        api: apiMock
    };
});

const renderWithRouter = (ui, { route = '/' } = {}) => {
    return render(
        <MemoryRouter initialEntries={[route]}>
            {ui}
        </MemoryRouter>
    );
};

describe('Pruebas de Integración Frontend', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Evitar el recargo de pagina en JSDOM
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: vi.fn(), pathname: '/' },
        });
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('Flujo 1: Navegación y Roles Global (RutaProtegida)', () => {
        const AppTestRouter = () => (
            <Routes>
                <Route path="/" element={<div>Pantalla Inicial</div>} />
                <Route path="/login" element={<div>Pantalla Login</div>} />
                <Route path="/protegida" element={
                    <RutaProtegida rolRequerido={1}>
                        <div>Contenido Admin</div>
                    </RutaProtegida>
                } />
                <Route path="/asesor" element={
                    <RutaProtegida rolRequerido={2}>
                        <div>Contenido Asesor</div>
                    </RutaProtegida>
                } />
            </Routes>
        );

        it('Debe redirigir al login si un usuario anónimo intenta acceder a una ruta protegida', async () => {
            renderWithRouter(<AppTestRouter />, { route: '/protegida' });
            // Redirige al login
            await waitFor(() => {
                expect(screen.getByText('Pantalla Login')).toBeInTheDocument();
            });
        });

        it('Debe permitir acceso al Asesor (rol 2) a su ruta, pero bloquearle la de Admin', async () => {
            localStorage.setItem('usuario', JSON.stringify({ id_rol: 2, id_usuario: 5 }));
            
            // Acceso Asesor
            const { unmount } = renderWithRouter(<AppTestRouter />, { route: '/asesor' });
            expect(screen.getByText('Contenido Asesor')).toBeInTheDocument();
            
            unmount();

            // Intento Admin
            renderWithRouter(<AppTestRouter />, { route: '/protegida' });
            await waitFor(() => {
                expect(screen.getByText('Pantalla Inicial')).toBeInTheDocument();
            });
        });
    });

    describe('Flujo 2: Ciclo de vida de una Venta (Render, Búsqueda y Anulación en Historial)', () => {
        const mockHistorial = [
            { id_venta: 100, fecha: new Date().toISOString(), cliente: "Cliente Integracion", producto: "Laptop X", cantidad: 1, total: 1500, estado_venta: "Completada" },
            { id_venta: 101, fecha: new Date().toISOString(), cliente: "Otro Cliente", producto: "Mouse", cantidad: 2, total: 40, estado_venta: "Completada" }
        ];

        it('Permite ver, buscar y anular una venta correctamente', async () => {
            localStorage.setItem('usuario', JSON.stringify({ id_rol: 1, id_usuario: 1 }));
            ventasService.crearDevolucion.mockResolvedValue({ success: true });
            
            renderWithRouter(<SalesHistory historial={mockHistorial} formatearMoneda={(num) => `$${num}`} />, { route: '/historial' });
            
            // 1. Verificar carga inicial
            expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
            expect(screen.getByText('Cliente Integracion')).toBeInTheDocument();

            // 2. Realizar búsqueda
            const inputBusqueda = screen.getByPlaceholderText(/Buscar por cliente/i);
            fireEvent.change(inputBusqueda, { target: { value: 'Laptop' } });
            
            await waitFor(() => {
                expect(screen.queryByText('Otro Cliente')).not.toBeInTheDocument();
            });

            // 3. Iniciar anulación
            const rowTarget = screen.getByText('Cliente Integracion').closest('tr');
            const btnDevolver = within(rowTarget).getByRole('button', { name: /Devolver/i });
            fireEvent.click(btnDevolver);

            // Verificar modal
            await waitFor(() => {
                expect(screen.getByText(/Anular Venta #100/i)).toBeInTheDocument();
            });
            
            // Justificar y confirmar
            const textarea = screen.getByPlaceholderText(/Justifique el motivo/i);
            fireEvent.change(textarea, { target: { value: 'Motivo de integración' } });
            fireEvent.click(screen.getByText('Confirmar Anulación'));

            // 4. Verificar respuesta de la API
            await waitFor(() => {
                expect(ventasService.crearDevolucion).toHaveBeenCalledWith(100, 'Motivo de integración');
                expect(window.location.reload).toHaveBeenCalled(); // Se actualizó
            });
        });
    });

    describe('Flujo 3: Creación completa de Cotización (Componentes + Autocompletado + API)', () => {
        const mockProductos = { productos: [{ id_producto: 1, codigo_interno: "P01", nombre_producto: "Teclado", precio: 50, stock: 10 }] };
        const mockClientes = { clientes: [{ id_cliente: 1, identificacion: "123", nombre_cliente: "Juan Perez" }] };

        beforeEach(() => {
            Object.defineProperty(window, 'open', { value: vi.fn(() => ({ document: { write: vi.fn(), close: vi.fn() }, print: vi.fn() })), writable: true });
            localStorage.setItem('usuario', JSON.stringify({ id_rol: 2, id_usuario: 3 }));
            api.get.mockImplementation((url) => {
                if (url.includes('/productos')) return Promise.resolve(mockProductos);
                if (url.includes('/clientes')) return Promise.resolve(mockClientes);
                return Promise.resolve([]);
            });
            api.post.mockResolvedValue({ success: true });
        });

        it('Permite agregar cliente, producto, calcular totales y emitir la cotización', async () => {
            renderWithRouter(<Pedidos />, { route: '/cotizaciones/nueva' });

            // 1. Cargar datos base
            await waitFor(() => {
                expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
            });

            // 2. Seleccionar Cliente (Manejo de Autocompletado)
            const inputCliente = screen.getByPlaceholderText(/Buscar por nombre o identificación/i);
            fireEvent.change(inputCliente, { target: { value: 'Juan' } });
            // Clic en la sugerencia
            await waitFor(() => {
                expect(screen.getByText(/Juan Perez/i)).toBeInTheDocument();
            });
            const sugerenciaCliente = screen.getByText(/Juan Perez/i);
            fireEvent.click(sugerenciaCliente);
            // El cliente debe ser seleccionado en el input (el autocompletado bloquea el texto en el valor)
            expect(inputCliente.value).toBe('Juan Perez');

            // 3. Agregar Producto
            const btnAñadir = screen.getByRole('button', { name: /Añadir/i });
            fireEvent.click(btnAñadir);

            // 4. Cálculos Automáticos
            expect(screen.getByText(/Total Final/i)).toBeInTheDocument();
            
            // 5. Configurar Cotización y Emitir
            const inputVigencia = screen.getByLabelText(/Vigencia/i);
            fireEvent.change(inputVigencia, { target: { value: '2050-12-31' } });

            const btnCotizar = screen.getByText(/Generar Cotización/i);
            fireEvent.click(btnCotizar);

            // 6. Validar integración con Backend
            await waitFor(() => {
                expect(api.post).toHaveBeenCalled();
                const callData = api.post.mock.calls[0];
                expect(callData[0]).toBe('/cotizaciones');
                expect(callData[1].detalles[0].id_producto).toBe(1);
            });
        });
    });

    describe('Flujo 4: Autenticación Completa (Login)', () => {
        beforeEach(() => {
            api.post.mockImplementation((url) => {
                if (url.includes('/auth/login')) return Promise.resolve({ user: { id_usuario: 1, id_rol: 1, primer_nombre: "Admin" } });
                return Promise.resolve({});
            });
        });

        const AppLoginRouter = () => (
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/DashboardAdmin" element={<div>Panel Dashboard</div>} />
            </Routes>
        );

        it('Permite al usuario loguearse y lo redirige al dashboard', async () => {
            renderWithRouter(<AppLoginRouter />);
            
            const inputCorreo = screen.getByPlaceholderText(/ejemplo@correo.com/i);
            const inputContrasena = screen.getByPlaceholderText(/••••••••/i);
            
            fireEvent.change(inputCorreo, { target: { value: 'admin@correo.com' } });
            fireEvent.change(inputContrasena, { target: { value: '123456' } });
            
            const btnSubmit = screen.getByRole('button', { name: /Iniciar Sesión/i });
            fireEvent.click(btnSubmit);
            
            await waitFor(() => {
                expect(screen.getByText(/¡Bienvenido, Admin!/i)).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByText('Panel Dashboard')).toBeInTheDocument();
            }, { timeout: 2000 }); // Redirección tiene setTimeout 1200ms
        });
    });

    describe('Flujo 5: Gestión de Inventario (Crear Producto)', () => {
        beforeEach(() => {
            localStorage.setItem('usuario', JSON.stringify({ id_rol: 1, id_usuario: 1 }));
            api.get.mockImplementation((url) => {
                if (url.includes('/productos')) return Promise.resolve([]);
                if (url.includes('/categorias')) return Promise.resolve([{ id_categoria: 1, nombre_categoria: "Suplementos" }]);
                return Promise.resolve({});
            });
            api.post.mockImplementation((url) => {
                if (url.includes('/productos')) return Promise.resolve({ success: true, message: "Producto creado" });
                return Promise.resolve({});
            });
        });

        it('Permite llenar el formulario y crear un nuevo producto', async () => {
            renderWithRouter(<Catalogo />);
            
            await waitFor(() => {
                expect(screen.getByText(/Todo el Inventario/i)).toBeInTheDocument();
            });

            // Abrir modal
            const btnNuevo = screen.getByRole('button', { name: /Nuevo Producto/i });
            fireEvent.click(btnNuevo);
            
            // Llenar formulario
            const inputSKU = screen.getByPlaceholderText(/PRN-001/i);
            fireEvent.change(inputSKU, { target: { value: 'NEW-01' } });
            
            const selectCat = screen.getByRole('combobox');
            fireEvent.change(selectCat, { target: { value: '1' } });
            
            // Inputs sin placeholders específicos, se buscan por name (simulando querySelector)
            const inputNombre = document.querySelector('input[name="nombre_producto"]');
            fireEvent.change(inputNombre, { target: { value: 'Nuevo Suplemento' } });
            
            const inputPrecio = document.querySelector('input[name="precio"]');
            fireEvent.change(inputPrecio, { target: { value: '5000' } });
            
            const inputStock = document.querySelector('input[name="stock"]');
            fireEvent.change(inputStock, { target: { value: '20' } });
            
            // Submit
            const btnGuardar = screen.getByRole('button', { name: /Guardar Producto/i });
            fireEvent.click(btnGuardar);
            
            await waitFor(() => {
                expect(screen.getByText(/Producto creado/i)).toBeInTheDocument();
                expect(api.post).toHaveBeenCalled();
            });
        });
    });

    describe('Flujo 6: Venta Efectiva (Checkout de Pedido)', () => {
        const mockProductos = { productos: [{ id_producto: 1, codigo_interno: "P01", nombre_producto: "Teclado", precio: 50, stock: 10 }] };
        const mockClientes = { clientes: [{ id_cliente: 1, identificacion: "123", nombre_cliente: "Juan Perez" }] };

        beforeEach(() => {
            localStorage.setItem('usuario', JSON.stringify({ id_rol: 2, id_usuario: 3 }));
            api.get.mockImplementation((url) => {
                if (url.includes('/productos')) return Promise.resolve(mockProductos);
                if (url.includes('/clientes')) return Promise.resolve(mockClientes);
                if (url.includes('/categorias')) return Promise.resolve([{ id_categoria: 1, nombre_categoria: "General" }]);
                return Promise.resolve({});
            });
            api.post.mockImplementation((url, body) => {
                if (url.includes('/auth/login')) return Promise.resolve({ user: { id_usuario: 1, id_rol: 1, primer_nombre: "Admin" } });
                if (url.includes('/productos')) return Promise.resolve({ success: true, message: "Producto creado" });
                if (url.includes('/pedidos')) return Promise.resolve({ id_pedido: 100, success: true });
                if (url.includes('/cotizaciones')) return Promise.resolve({ success: true });
                return Promise.resolve({});
            });
        });

        it('Permite agregar productos y confirmar pedido vaciando el carrito', async () => {
            renderWithRouter(<Pedidos />);
            
            await waitFor(() => {
                expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
            });

            // 1. Agregar Producto
            const btnAñadir = screen.getByRole('button', { name: /Añadir/i });
            fireEvent.click(btnAñadir);

            // 2. Cliente
            const inputCliente = screen.getByPlaceholderText(/Buscar por nombre o identificación/i);
            fireEvent.change(inputCliente, { target: { value: 'Juan' } });
            await waitFor(() => {
                expect(screen.getByText(/Juan Perez/i)).toBeInTheDocument();
            });
            fireEvent.click(screen.getByText(/Juan Perez/i));
            
            // 3. Confirmar
            const btnConfirmar = screen.getByRole('button', { name: /Confirmar Pedido/i });
            fireEvent.click(btnConfirmar);
            
            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/pedidos', expect.any(Object));
                expect(screen.getByText(/creado exitosamente/i)).toBeInTheDocument();
            });
            
            // 4. El carrito debe haberse vaciado automáticamente
            await waitFor(() => {
                expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
            });
        });
    });
});
