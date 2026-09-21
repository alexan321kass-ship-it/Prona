import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Clientes from './Clientes';
import { clientesService } from './clientes.service';

vi.mock('./clientes.service', () => ({
    clientesService: {
        getAll: vi.fn(),
        search: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Clientes - Validaciones de Formato y Tipos de Datos', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('usuario', JSON.stringify({ id_rol: 1, id_usuario: 99 }));
        clientesService.getAll.mockResolvedValue([
            {
                id_cliente: 1,
                nombre_cliente: "Empresa Los Alpes",
                identificacion: "900123456",
                telefono_cliente: "3001234567",
                correo_cliente: "contacto@alpes.com",
                direccion_cliente: "Calle 10 # 20-30"
            }
        ]);
    });

    it('Rechaza el registro si el nombre del cliente contiene números', async () => {
        renderWithRouter(<Clientes />);

        await waitFor(() => expect(screen.getByText('Empresa Los Alpes')).toBeInTheDocument());

        fireEvent.click(screen.getByText(/Nuevo Cliente/i));

        const inputNombre = screen.getByPlaceholderText('Nombre del cliente');
        fireEvent.change(inputNombre, { target: { value: 'Cliente 123' } });
        fireEvent.change(screen.getByPlaceholderText(/Número de documento/i), { target: { value: '999888777' } });

        // Verifica aviso en tiempo real
        expect(screen.getByText(/El nombre no puede contener números/i)).toBeInTheDocument();

        const form = screen.getByRole('button', { name: /Guardar Cliente/i }).closest('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getAllByText(/El nombre del cliente no puede contener números/i).length).toBeGreaterThan(0);
        });

        expect(clientesService.create).not.toHaveBeenCalled();
    });

    it('Rechaza el registro si el nombre del cliente contiene caracteres especiales', async () => {
        renderWithRouter(<Clientes />);

        await waitFor(() => expect(screen.getByText('Empresa Los Alpes')).toBeInTheDocument());

        fireEvent.click(screen.getByText(/Nuevo Cliente/i));

        const inputNombre = screen.getByPlaceholderText('Nombre del cliente');
        fireEvent.change(inputNombre, { target: { value: 'Cliente <script>' } });
        fireEvent.change(screen.getByPlaceholderText(/Número de documento/i), { target: { value: '999888777' } });

        // Verifica aviso en tiempo real
        expect(screen.getByText(/El nombre no permite caracteres especiales/i)).toBeInTheDocument();

        const form = screen.getByRole('button', { name: /Guardar Cliente/i }).closest('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getAllByText(/El nombre del cliente no permite caracteres especiales/i).length).toBeGreaterThan(0);
        });

        expect(clientesService.create).not.toHaveBeenCalled();
    });

    it('Rechaza el registro si la identificación contiene letras', async () => {
        renderWithRouter(<Clientes />);

        await waitFor(() => expect(screen.getByText('Empresa Los Alpes')).toBeInTheDocument());

        fireEvent.click(screen.getByText(/Nuevo Cliente/i));

        fireEvent.change(screen.getByPlaceholderText('Nombre del cliente'), { target: { value: 'Cliente Valido' } });
        const inputId = screen.getByPlaceholderText(/Número de documento/i);
        fireEvent.change(inputId, { target: { value: 'ABC123XYZ' } });

        // Verifica aviso en tiempo real
        expect(screen.getAllByText(/La identificación solo puede contener números/i).length).toBeGreaterThan(0);

        const form = screen.getByRole('button', { name: /Guardar Cliente/i }).closest('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getAllByText(/La identificación solo puede contener números/i).length).toBeGreaterThan(0);
        });

        expect(clientesService.create).not.toHaveBeenCalled();
    });

    it('Rechaza el registro si el teléfono tiene formato no numérico o cantidad de dígitos errónea', async () => {
        renderWithRouter(<Clientes />);

        await waitFor(() => expect(screen.getByText('Empresa Los Alpes')).toBeInTheDocument());

        fireEvent.click(screen.getByText(/Nuevo Cliente/i));

        fireEvent.change(screen.getByPlaceholderText('Nombre del cliente'), { target: { value: 'Cliente Valido' } });
        fireEvent.change(screen.getByPlaceholderText(/Número de documento/i), { target: { value: '123456789' } });
        const inputTel = screen.getByPlaceholderText(/7 a 10 dígitos numéricos/i);
        fireEvent.change(inputTel, { target: { value: '123' } });

        // Verifica aviso en tiempo real
        expect(screen.getByText(/Debe ser numérico \(7-10 dígitos\)/i)).toBeInTheDocument();

        const form = screen.getByRole('button', { name: /Guardar Cliente/i }).closest('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/El teléfono solo puede contener entre 7 y 10 números/i)).toBeInTheDocument();
        });

        expect(clientesService.create).not.toHaveBeenCalled();
    });

    it('Permite el registro exitoso cuando todos los datos tienen el formato correcto', async () => {
        clientesService.create.mockResolvedValue({ message: "Cliente creado exitosamente" });

        renderWithRouter(<Clientes />);

        await waitFor(() => expect(screen.getByText('Empresa Los Alpes')).toBeInTheDocument());

        fireEvent.click(screen.getByText(/Nuevo Cliente/i));

        fireEvent.change(screen.getByPlaceholderText('Nombre del cliente'), { target: { value: 'Cliente Valido' } });
        fireEvent.change(screen.getByPlaceholderText(/Número de documento/i), { target: { value: '987654321' } });
        fireEvent.change(screen.getByPlaceholderText(/7 a 10 dígitos numéricos/i), { target: { value: '3151234567' } });
        fireEvent.change(screen.getByPlaceholderText(/correo@ejemplo.com/i), { target: { value: 'valido@correo.com' } });

        const form = screen.getByRole('button', { name: /Guardar Cliente/i }).closest('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(clientesService.create).toHaveBeenCalledWith({
                nombre_cliente: 'Cliente Valido',
                identificacion: '987654321',
                telefono: '3151234567',
                correo: 'valido@correo.com',
                direccion: ''
            });
        });
    });
});
