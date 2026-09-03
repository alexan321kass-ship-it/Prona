import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SalesHistory from './SalesHistory';

const formatearMoneda = (num) => `$${num}`;

describe('Matriz de Casos de Prueba - Historial de Ventas (CP-010)', () => {
    
    const mockHistorial = [
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
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('usuario', JSON.stringify({ id_rol: 1, id_usuario: 99 }));
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('CP-010-001: Consultar historial de un cliente con ventas existentes', () => {
        render(<SalesHistory historial={mockHistorial} formatearMoneda={formatearMoneda} />);
        expect(screen.getAllByText(/Juan Perez/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/Producto Antiguo/i)).toBeInTheDocument();
    });

    it('CP-010-002: Validar orden cronológico inverso del historial', () => {
        render(<SalesHistory historial={mockHistorial} formatearMoneda={formatearMoneda} />);
        // Maria Gomez es la más nueva, debe estar primero
        const rows = screen.getAllByRole('row');
        // row[0] es the header
        expect(within(rows[1]).getByText(/Maria Gomez/i)).toBeInTheDocument();
        expect(within(rows[2]).getByText(/Juan Perez/i)).toBeInTheDocument();
    });

    it('CP-010-003: Buscar un cliente o producto específico en pantalla', async () => {
        render(<SalesHistory historial={mockHistorial} formatearMoneda={formatearMoneda} />);
        
        const inputBusqueda = screen.getByPlaceholderText(/Buscar por cliente/i);
        fireEvent.change(inputBusqueda, { target: { value: 'Juan' } });
        
        // Se debe mostrar Juan y filtrar Maria
        await waitFor(() => {
            expect(screen.getAllByText(/Juan Perez/i).length).toBeGreaterThan(0);
            expect(screen.queryByText(/Maria Gomez/i)).not.toBeInTheDocument();
        });
    });

    it('CP-010-004: Intentar consultar el historial sin haber iniciado sesión', () => {
        localStorage.removeItem('usuario');
        render(<SalesHistory historial={mockHistorial} formatearMoneda={formatearMoneda} />);
        
        expect(screen.getByText(/Acceso Denegado/i)).toBeInTheDocument();
        expect(screen.getByText(/Debe iniciar sesión/i)).toBeInTheDocument();
        expect(screen.queryByText(/Juan Perez/i)).not.toBeInTheDocument();
    });

    it('CP-010-005: Consultar un cliente recién creado sin ventas', () => {
        render(<SalesHistory historial={[]} formatearMoneda={formatearMoneda} />);
        // Al no tener ventas, muestra "No se encontraron registros de ventas" o tabla vacía con mensaje
        expect(screen.getByText(/No se encontraron resultados/i)).toBeInTheDocument();
    });

    it('CP-010-006: Validar campo de nombre de cliente e identificación', () => {
        render(<SalesHistory historial={mockHistorial} formatearMoneda={formatearMoneda} />);
        // Verificar que nombre e ID están
        expect(screen.getAllByText(/Juan Perez/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/ID: 123456/i)).toBeInTheDocument();
    });

    it('CP-010-007: Validar límite de filas visibles en el historial', () => {
        // Generamos 55 registros
        const granHistorial = Array.from({ length: 55 }, (_, i) => ({
            id_venta: i + 100,
            fecha: new Date().toISOString(),
            cliente: `Cliente ${i}`,
            producto: "Prod",
            cantidad: 1,
            total: 10,
            estado_venta: "Completada"
        }));

        render(<SalesHistory historial={granHistorial} formatearMoneda={formatearMoneda} />);
        
        // Deben haber 51 rows (1 header + 50 datos)
        const rows = screen.getAllByRole('row');
        expect(rows.length).toBe(51);
        
        // Verifica que se muestra la paginación
        expect(screen.getByText(/Mostrando 1–50/i)).toBeInTheDocument();
    });

    it('CP-RF010.1-008: Validar visualización de venta anulada/cancelada', () => {
        render(<SalesHistory historial={mockHistorial} formatearMoneda={formatearMoneda} />);
        // Maria Gomez está cancelada
        expect(screen.getByText('Cancelada')).toBeInTheDocument();
    });

    it('CP-RF010.1-009: Validar que no se pueda devolver una venta ya cancelada', () => {
        render(<SalesHistory historial={mockHistorial} formatearMoneda={formatearMoneda} />);
        // Maria Gomez está cancelada, no debería tener botón de devolución
        const rows = screen.getAllByRole('row');
        // Row de Maria (índice 1 por orden cronológico inverso)
        const botonDevolver = within(rows[1]).queryByText(/Devolver/i);
        expect(botonDevolver).not.toBeInTheDocument();
    });

    it('CP-RF010.1-0010: Validar inmutabilidad de precios en el historial', () => {
        render(<SalesHistory historial={mockHistorial} formatearMoneda={formatearMoneda} />);
        // Verificamos que el total se renderiza formateado tal cual se pasó
        expect(screen.getByText('$100')).toBeInTheDocument();
        expect(screen.getByText('$200')).toBeInTheDocument();
    });
});
