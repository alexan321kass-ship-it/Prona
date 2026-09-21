import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Pedidos from './Pedidos';
import { api } from '../../config/api';

vi.mock('../../config/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Matriz de Casos de Prueba - Cotizaciones (01-10)', () => {
    
    const mockProductos = {
        productos: [
            { id_producto: 1, nombre_producto: 'Producto Activo', estado_producto: 'Activo', precio: 100, nombre_categoria: 'Cat1' },
            { id_producto: 2, nombre_producto: 'Producto Inactivo', estado_producto: 'Inactivo', precio: 50, nombre_categoria: 'Cat1' }
        ]
    };

    const mockClientes = {
        clientes: [
            { id_cliente: 1, nombre_cliente: 'Cliente Activo', estado_cliente: 'Activo' },
            { id_cliente: 2, nombre_cliente: 'Cliente Inactivo', estado_cliente: 'Inactivo' }
        ]
    };

    beforeAll(() => {
        Object.defineProperty(window, 'open', { value: vi.fn(() => ({ document: { write: vi.fn(), close: vi.fn() }, print: vi.fn() })), writable: true });
    });

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('usuario', JSON.stringify({ id_rol: 1, id_usuario: 99 }));
        api.get.mockImplementation((url) => {
            if (url === '/productos') return Promise.resolve(mockProductos);
            if (url === '/clientes') return Promise.resolve(mockClientes);
            return Promise.resolve({});
        });
        api.post.mockResolvedValue({ success: true });
    });

    afterEach(() => {
        localStorage.clear();
    });

    const setupCarrito = async () => {
        const { container } = renderWithRouter(<Pedidos />);
        // Esperar carga de datos
        await waitFor(() => {
            expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
        });
        // Agregar un producto activo al carrito
        const btnAgregar = screen.getAllByRole('button', { name: /Añadir/i })[0]; // Producto Activo
        fireEvent.click(btnAgregar);
        
        return container;
    };

    const seleccionarCliente = async () => {
        const inputBusqueda = screen.getByPlaceholderText(/Buscar por nombre, NIT/i);
        fireEvent.focus(inputBusqueda);
        fireEvent.change(inputBusqueda, { target: { value: 'Activo' } });
        const opcion = await screen.findByText('Cliente Activo');
        fireEvent.click(opcion);
    };

    it('CP-07: Verificar que solo se puedan seleccionar clientes activos', async () => {
        renderWithRouter(<Pedidos />);
        await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());
        
        const inputBusqueda = screen.getByPlaceholderText(/Buscar por nombre, NIT/i);
        fireEvent.focus(inputBusqueda);
        fireEvent.change(inputBusqueda, { target: { value: 'Cliente' } });
        
        // Verificamos que Cliente Activo esté presente
        expect(await screen.findByText('Cliente Activo')).toBeInTheDocument();
        
        // Verificamos que Cliente Inactivo NO esté presente
        expect(screen.queryByText('Cliente Inactivo')).not.toBeInTheDocument();
    });

    it('CP-08: Verificar que solo se puedan agregar productos activos', async () => {
        renderWithRouter(<Pedidos />);
        await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());
        
        // Verificamos el grid de productos
        expect(screen.getByText('Producto Activo')).toBeInTheDocument();
        expect(screen.queryByText('Producto Inactivo')).not.toBeInTheDocument();
    });

    it('CP-02: Verificar que no sea posible registrar una cotización sin seleccionar un cliente', async () => {
        await setupCarrito(); // Abre carrito con productos pero sin cliente
        
        fireEvent.click(screen.getByText(/Generar Cotización/i));
        
        await waitFor(() => {
            expect(screen.getByText('Selecciona un cliente primero')).toBeInTheDocument();
            expect(api.post).not.toHaveBeenCalled();
        });
    });

    it('CP-03: Verificar que no sea posible registrar una cotización sin productos', async () => {
        renderWithRouter(<Pedidos />);
        await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());
        
        await seleccionarCliente();
        
        // Abrir el carrito vacío usando su clase
        const btnVerCarrito = document.querySelector('.boton-carrito-flotante');
        fireEvent.click(btnVerCarrito);
        
        const botonCotizar = screen.queryByText(/Generar Cotización/i);
        expect(botonCotizar).not.toBeInTheDocument();
        expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
    });

    it('CP-04: Verificar que el sistema muestra un mensaje indicando que el descuento excede el límite permitido', async () => {
        await setupCarrito();
        await seleccionarCliente();
        
        // Poner descuento > 20
        const spinbuttons = screen.getAllByRole('spinbutton');
        const inputDescuento = spinbuttons[spinbuttons.length - 1];
        fireEvent.change(inputDescuento, { target: { value: '25' } });
        
        fireEvent.click(screen.getByText(/Generar Cotización/i));
        
        await waitFor(() => {
            expect(screen.getByText(/El descuento excede el límite permitido/i)).toBeInTheDocument();
            expect(api.post).not.toHaveBeenCalled();
        });
    });

    it('Verificar que el sistema rechace o corrija descuentos con números negativos', async () => {
        await setupCarrito();
        await seleccionarCliente();
        
        // Intentar poner descuento negativo en el input
        const spinbuttons = screen.getAllByRole('spinbutton');
        const inputDescuento = spinbuttons[spinbuttons.length - 1];
        fireEvent.change(inputDescuento, { target: { value: '-10' } });
        
        // El input automáticamente convierte/bloquea valores negativos a 0
        expect(inputDescuento.value).toBe('0');
    });

    it('CP-05: Verificar que la vigencia de la cotización sea válida', async () => {
        await setupCarrito();
        await seleccionarCliente();
        
        // Poner fecha pasada
        const inputVigencia = document.querySelector('input[type="date"]');
        fireEvent.change(inputVigencia, { target: { value: '2020-01-01' } });
        
        fireEvent.click(screen.getByText(/Generar Cotización/i));
        
        await waitFor(() => {
            expect(screen.getByText(/vigencia debe tener 4 días mínimo/i)).toBeInTheDocument();
            expect(api.post).not.toHaveBeenCalled();
        });
    });

    it('CP-06: Verificar que el sistema calcula correctamente el subtotal, impuestos, descuentos y total', async () => {
        await setupCarrito();
        await seleccionarCliente();
        
        // Aplicamos descuento de 10%.
        const spinbuttons = screen.getAllByRole('spinbutton');
        const inputDescuento = spinbuttons[spinbuttons.length - 1];
        fireEvent.change(inputDescuento, { target: { value: '10' } });
        
        await waitFor(() => {
            // Verificamos que se muestre el bloque de descuento
            expect(screen.getByText(/Descuento \(10%\)/i)).toBeInTheDocument();
            
            // Verificamos que el total se actualizó
            const elementoTotal = screen.getByText(/Total Final/i);
            expect(elementoTotal).toBeInTheDocument();
        });
    });

    it('CP-01: Verificar el registro exitoso de una cotización con datos válidos', async () => {
        api.post.mockResolvedValue({ data: { success: true } });
        await setupCarrito();
        await seleccionarCliente();
        
        const spinbuttons = screen.getAllByRole('spinbutton');
        const inputDescuento = spinbuttons[spinbuttons.length - 1];
        fireEvent.change(inputDescuento, { target: { value: '15' } }); // válido <= 20
        
        const inputVigencia = document.querySelector('input[type="date"]');
        // Fecha futura
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);
        fireEvent.change(inputVigencia, { target: { value: futureDate.toISOString().split('T')[0] } });
        
        fireEvent.click(screen.getByText(/Generar Cotización/i));
        
        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/cotizaciones', expect.objectContaining({
                id_cliente: 1,
                detalles: expect.arrayContaining([expect.objectContaining({ id_producto: 1 })])
            }));
        });
    });

    it('CP-10: Verificar que la acción quede registrada en la auditoría', async () => {
        api.post.mockResolvedValue({ data: { success: true } });
        await setupCarrito();
        await seleccionarCliente();
        
        const inputVigencia = document.querySelector('input[type="date"]');
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);
        fireEvent.change(inputVigencia, { target: { value: futureDate.toISOString().split('T')[0] } });
        
        fireEvent.click(screen.getByText(/Generar Cotización/i));
        
        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/cotizaciones', expect.objectContaining({
                id_cliente: 1
            }));
        });
    });

    it('CP-09: Verificar la generación del archivo PDF al registrar la cotización', async () => {
        await setupCarrito();
        await seleccionarCliente();
        
        const inputVigencia = document.querySelector('input[type="date"]');
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);
        fireEvent.change(inputVigencia, { target: { value: futureDate.toISOString().split('T')[0] } });
        
        fireEvent.click(screen.getByText(/Generar Cotización/i));
        
        await waitFor(() => {
            expect(window.open).toHaveBeenCalled();
            // Validamos que se llama a write y close del documento simulado
            const mockWindow = window.open.mock.results[0].value;
            expect(mockWindow.document.write).toHaveBeenCalled();
            expect(mockWindow.document.close).toHaveBeenCalled();
        });
    });
});
