import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SalesHistory from './SalesHistory';
import { ventasService } from '../../ventas/ventas.service';

vi.mock('../../ventas/ventas.service', () => ({
    ventasService: {
        crearDevolucion: vi.fn()
    }
}));

const formatearMoneda = (num) => `$${num}`;
const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Matriz de Casos de Prueba - Anulación de Ventas (CP-RF007.4)', () => {
    
    const mockHistorial = [
        {
            id_venta: 1,
            fecha: new Date().toISOString(), // Venta reciente (< 24h)
            cliente: "Juan Perez",
            producto: "Producto A",
            cantidad: 2,
            total: 100,
            estado_venta: "Completada"
        },
        {
            id_venta: 2,
            fecha: new Date(Date.now() - (48 * 60 * 60 * 1000)).toISOString(), // Venta antigua (> 24h)
            cliente: "Maria Gomez",
            producto: "Producto B",
            cantidad: 1,
            total: 50,
            estado_venta: "Completada"
        },
        {
            id_venta: 3,
            fecha: new Date().toISOString(),
            cliente: "Pedro Ruiz",
            producto: "Producto C (Varios)", // Múltiples productos
            cantidad: 3,
            total: 300,
            estado_venta: "Completada"
        },
        {
            id_venta: 4,
            fecha: new Date().toISOString(),
            cliente: "Laura Diaz",
            producto: "Producto D",
            cantidad: 1,
            total: 20,
            estado_venta: "Cancelada" // Ya anulada
        }
    ];

    beforeAll(() => {
        // Mock de window.location.reload para evitar errores en JSDOM
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: vi.fn() },
        });
    });

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('usuario', JSON.stringify({ id_rol: 1, id_usuario: 99 })); // Admin por defecto
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('CP-RF007.4-01: Validar la anulación lógica exitosa de una venta', async () => {
        ventasService.crearDevolucion.mockResolvedValue({ success: true });
        
        renderWithRouter(<SalesHistory historial={mockHistorial} formatearMoneda={formatearMoneda} />);
        
        // Buscamos el botón "Devolver" de la Venta 1 (Juan Perez)
        const rowJuan = screen.getByText('Juan Perez').closest('tr');
        const botonDevolver = within(rowJuan).getByRole('button', { name: /Devolver/i });
        fireEvent.click(botonDevolver);

        // Verificamos que el modal se abre
        expect(screen.getByText(/Venta #1/i)).toBeInTheDocument();

        // Ingresamos un motivo válido
        const textarea = screen.getByPlaceholderText(/Describe el motivo/i);
        fireEvent.change(textarea, { target: { value: 'El cliente devolvió el producto' } });

        // Confirmamos anulación
        fireEvent.click(screen.getByText(/Confirmar Anulación/i));

        await waitFor(() => {
            expect(ventasService.crearDevolucion).toHaveBeenCalledWith(1, 'El cliente devolvió el producto');
            expect(window.location.reload).toHaveBeenCalled(); // Se generó la confirmación y se refrescó
        });
    });

    it('CP-RF007.4-02: Validar que el sistema impida anular una venta sin justificación (FE-02)', async () => {
        renderWithRouter(<SalesHistory historial={mockHistorial} formatearMoneda={formatearMoneda} />);
        
        const rowJuan = screen.getByText('Juan Perez').closest('tr');
        const botonDevolver = within(rowJuan).getByRole('button', { name: /Devolver/i });
        fireEvent.click(botonDevolver);

        // Dejar el motivo en blanco e intentar anular
        const textarea = screen.getByPlaceholderText(/Describe el motivo/i);
        expect(textarea.value).toBe('');
        
        fireEvent.click(screen.getByText(/Confirmar Anulación/i));

        // Esperar el error FE-02 en pantalla y que NO se llame al servicio
        await waitFor(() => {
            expect(screen.getByText(/El motivo de anulación es obligatorio \(FE-02\)/i)).toBeInTheDocument();
            expect(ventasService.crearDevolucion).not.toHaveBeenCalled();
        });
    });

    it('CP-RF007.4-03: Validar que el sistema impida la doble anulación de una transacción previamente anulada (FE-01)', () => {
        renderWithRouter(<SalesHistory historial={mockHistorial} formatearMoneda={formatearMoneda} />);
        
        // Venta 4 ya está cancelada. El botón no debería existir en su fila.
        // Verificamos visualmente que en su fila aparezca "Anulada"
        const estadoAnulada = screen.getAllByText('Anulada');
        expect(estadoAnulada.length).toBeGreaterThan(0);
        
        // Verificamos que no podamos "Devolver" la venta 4 (que de 4 ventas, solo 3 tengan el botón Devolver, o menos si están expiradas)
        // Las ventas 1, 2 y 3 tienen el estado "Completada". El botón se muestra para 1 y 3 (el 2 está expirado y disabled pero renderizado)
        const botonesDevolver = screen.getAllByRole('button', { name: /Devolver/i });
        expect(botonesDevolver.length).toBe(3); 
    });

    it('CP-RF007.4-04: Verificar que un usuario con rol Asesor no tenga permisos para anular ventas (RN-001)', () => {
        // Simulamos ser un Asesor
        localStorage.setItem('usuario', JSON.stringify({ id_rol: 2 }));
        renderWithRouter(<SalesHistory historial={mockHistorial} formatearMoneda={formatearMoneda} />);
        
        // El botón "Devolver" no debe estar disponible en absoluto
        expect(screen.queryByRole('button', { name: /Devolver/i })).not.toBeInTheDocument();
    });

    it('CP-RF007.4-05: Validar que el sistema impida anular una venta después de 24 horas (RN-002)', () => {
        renderWithRouter(<SalesHistory historial={mockHistorial} formatearMoneda={formatearMoneda} />);
        
        // La venta 2 tiene más de 24 horas, su botón debe estar deshabilitado
        const rowMaria = screen.getByText('Maria Gomez').closest('tr');
        const botonVentaAntigua = within(rowMaria).getByRole('button', { name: /Devolver/i });
        
        expect(botonVentaAntigua).toBeDisabled();
        expect(botonVentaAntigua).toHaveAttribute('title', 'El tiempo límite para anular ha expirado (24h)');
    });

    it('CP-RF007.4-06: Validar la anulación de una venta que contiene múltiples productos', async () => {
        ventasService.crearDevolucion.mockResolvedValue({ success: true });
        
        renderWithRouter(<SalesHistory historial={mockHistorial} formatearMoneda={formatearMoneda} />);
        
        const rowPedro = screen.getByText('Pedro Ruiz').closest('tr');
        const botonVentaMultiple = within(rowPedro).getByRole('button', { name: /Devolver/i });
        fireEvent.click(botonVentaMultiple);
        
        const textarea = screen.getByPlaceholderText(/Describe el motivo/i);
        fireEvent.change(textarea, { target: { value: 'Devolución múltiple' } });
        fireEvent.click(screen.getByText(/Confirmar Anulación/i));

        // Backend reingresa, front solo confirma envío con ID = 3
        await waitFor(() => {
            expect(ventasService.crearDevolucion).toHaveBeenCalledWith(3, 'Devolución múltiple');
        });
    });

    it('CP-RF007.4-07: Validar que una venta anulada se refleje correctamente en los reportes', () => {
        renderWithRouter(<SalesHistory historial={mockHistorial} formatearMoneda={formatearMoneda} />);
        
        // Venta 4 está Cancelada. Verificamos que se renderice el span de "Cancelada" rojo en la fila.
        const etiquetaRoja = screen.getByText('Cancelada', { selector: 'span[style*="color: red"]' });
        expect(etiquetaRoja).toBeInTheDocument();
    });
});
