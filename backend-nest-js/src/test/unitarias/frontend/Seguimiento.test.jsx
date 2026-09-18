import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Seguimiento from './Seguimiento';
import { api } from '../../config/api';

vi.mock('../../config/api', () => ({
    api: {
        get: vi.fn(),
        put: vi.fn(),
        post: vi.fn()
    }
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Matriz de Casos de Prueba - Seguimiento de Pedidos (CP-RF009.1)', () => {

    const mockPedidoValido = {
        id_pedido: 101,
        nombre_cliente: "Juan Perez", 
        identificacion: "123456",
        fecha_pedido: "2024-01-01T10:00:00Z",
        estado_pedido: "En proceso",
        total: 50000
    };

    const mockSugerencias = [
        "101 - Juan Perez"
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('usuario', JSON.stringify({ id_rol: 1, id_usuario: 99, primer_nombre: "Admin" }));
        
        // Mock default behavior
        api.get.mockImplementation((url) => {
            if (url.includes('/seguimiento/sugerencias')) return Promise.resolve(mockSugerencias);
            if (url.includes('/pedidos?limite=100')) return Promise.resolve({ pedidos: [mockPedidoValido] });
            if (url.includes('/seguimiento/buscar?query=101')) return Promise.resolve([mockPedidoValido]);
            if (url.includes('/seguimiento/buscar?query=999')) return Promise.resolve([]);
            return Promise.resolve([]);
        });
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('CP-RF009.1-01: Verificar la consulta exitosa (renderiza datos del pedido)', async () => {
        renderWithRouter(<Seguimiento />);
        
        await waitFor(() => {
            expect(screen.getByText('Juan Perez')).toBeInTheDocument();
            expect(screen.getByText('En proceso')).toBeInTheDocument();
        });
    });

    it('CP-RF009.1-02: Verificar que no se permita consulta vacía (ID obligatorio)', async () => {
        renderWithRouter(<Seguimiento />);
        await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());

        // Hacemos una búsqueda vacía
        const inputBusqueda = screen.getByPlaceholderText(/Buscar por cliente/i);
        fireEvent.change(inputBusqueda, { target: { value: '   ' } });
        fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));

        await waitFor(() => {
            expect(screen.getByText('El ID del pedido es obligatorio')).toBeInTheDocument();
        });
    });

    it('CP-RF009.1-03: Verificar la consulta de un pedido inexistente', async () => {
        renderWithRouter(<Seguimiento />);
        await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());

        const inputBusqueda = screen.getByPlaceholderText(/Buscar por cliente/i);
        fireEvent.change(inputBusqueda, { target: { value: '999' } });
        fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));

        await waitFor(() => {
            expect(screen.getByText('El pedido no fue encontrado')).toBeInTheDocument();
        });
    });

    it('CP-RF009.1-04: Verificar la visualización del estado (Recibido)', async () => {
        const mockRecibido = { ...mockPedidoValido, id_pedido: 102, estado_pedido: "Recibido" };
        api.get.mockImplementation((url) => {
            if (url.includes('/pedidos?limite=100')) return Promise.resolve({ pedidos: [mockRecibido] });
            return Promise.resolve([]);
        });

        renderWithRouter(<Seguimiento />);
        await waitFor(() => {
            expect(screen.getByText('Recibido')).toBeInTheDocument();
        });
    });

    it('CP-RF009.1-05: Verificar la visualización de múltiples estados', async () => {
        const mockMultiples = [
            { ...mockPedidoValido, id_pedido: 101, estado_pedido: "En tránsito" },
            { ...mockPedidoValido, id_pedido: 102, estado_pedido: "Cancelado" },
            { ...mockPedidoValido, id_pedido: 103, estado_pedido: "Entregado" }
        ];
        api.get.mockImplementation((url) => {
            if (url.includes('/pedidos?limite=100')) return Promise.resolve({ pedidos: mockMultiples });
            return Promise.resolve([]);
        });

        renderWithRouter(<Seguimiento />);
        await waitFor(() => {
            expect(screen.getByText('En tránsito')).toBeInTheDocument();
            expect(screen.getByText('Cancelado')).toBeInTheDocument();
            expect(screen.getByText('Entregado')).toBeInTheDocument();
        });
    });

    it('CP-RF009.1-06: Verificar que solo los usuarios autorizados (Denegar acceso a rol inválido)', async () => {
        // Rol 99 no está permitido, solo 1, 2, 3
        localStorage.setItem('usuario', JSON.stringify({ id_rol: 99, id_usuario: 99 }));
        
        const { MemoryRouter, Routes, Route } = await import('react-router-dom');

        render(
            <MemoryRouter initialEntries={['/seguimiento']}>
                <Routes>
                    <Route path="/seguimiento" element={<Seguimiento />} />
                    <Route path="/login" element={<div>Página de Login Mockeada</div>} />
                </Routes>
            </MemoryRouter>
        );
        
        await waitFor(() => {
            expect(screen.getByText('Página de Login Mockeada')).toBeInTheDocument();
        });
        
        // El useEffect debió redireccionar, por lo tanto el cargarTodos() NO se ejecuta.
        expect(api.get).not.toHaveBeenCalledWith('/pedidos?limite=100');
    });

    it('CP-RF009.1-07: Verificar que la actualización de estado se refleja en UI', async () => {
        // En este componente no actualizamos, pero validamos que un cambio previo de DB se refleja en UI.
        renderWithRouter(<Seguimiento />);
        await waitFor(() => expect(screen.getByText('En proceso')).toBeInTheDocument());

        // Simulamos que el admin cambió el estado a Entregado y buscamos de nuevo
        api.get.mockImplementation((url) => {
            if (url.includes('/seguimiento/buscar?query=101')) {
                return Promise.resolve([{ ...mockPedidoValido, estado_pedido: 'Entregado' }]);
            }
            return Promise.resolve([]);
        });

        const inputBusqueda = screen.getByPlaceholderText(/Buscar por cliente/i);
        fireEvent.change(inputBusqueda, { target: { value: '101' } });
        fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));

        await waitFor(() => {
            expect(screen.queryByText('En proceso')).not.toBeInTheDocument();
            expect(screen.getByText('Entregado')).toBeInTheDocument();
        });
    });

    it('CP-RF009.1-08: Verificar el tiempo de respuesta (Actualización asíncrona)', async () => {
        renderWithRouter(<Seguimiento />);
        await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());
        
        // Realizamos otra búsqueda, el estado debe pasar a cargando y luego resolver sin recargar la página
        api.get.mockImplementation((url) => {
            if (url.includes('/seguimiento/buscar?query=101')) {
                return new Promise(resolve => setTimeout(() => resolve([{ ...mockPedidoValido, estado_pedido: 'Actualizado Rápido' }]), 100));
            }
            return Promise.resolve([]);
        });

        const inputBusqueda = screen.getByPlaceholderText(/Buscar por cliente/i);
        fireEvent.change(inputBusqueda, { target: { value: '101' } });
        fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));

        // La UI debería mostrar el estado de carga
        expect(screen.getByText('Buscando pedidos...')).toBeInTheDocument();

        // Luego de resolver asíncronamente, debería mostrar el nuevo estado
        await waitFor(() => {
            expect(screen.getByText('Actualizado Rápido')).toBeInTheDocument();
            expect(screen.queryByText('Buscando pedidos...')).not.toBeInTheDocument();
        });
    });

});
