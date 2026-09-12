import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Empleados from '../src/pages/Empleados';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';

const mockEmpleados = [
  { id: 1, nro: 1, nombre_completo: 'Carlos Méndez', cedula: 'V-20.123.456', departamento: 'Ventas', posicion_cargo: 'Vendedor', estado_operativo: 'Activo' },
  { id: 2, nro: 2, nombre_completo: 'Ana López', cedula: 'V-25.789.012', departamento: 'RRHH', posicion_cargo: 'Analista', estado_operativo: 'Vacaciones' },
];

vi.mock('../src/api/client', () => ({
  default: {
    get: vi.fn((url) => {
      if (url.includes('/empleados')) return Promise.resolve({ data: mockEmpleados });
      return Promise.resolve({ data: [] });
    }),
    delete: vi.fn().mockResolvedValue({}),
  },
}));

const renderEmpleados = () => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Empleados />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('Empleados Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-jwt-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, username: 'admin', rol: 'admin' }));
  });

  it('renderiza el título de la página', async () => {
    renderEmpleados();
    await waitFor(() => expect(screen.getByText('Empleados')).toBeInTheDocument());
  });

  it('muestra el botón de nuevo empleado', async () => {
    renderEmpleados();
    await waitFor(() => expect(screen.getByText(/nuevo empleado/i)).toBeInTheDocument());
  });

  it('carga y muestra la lista de empleados', async () => {
    renderEmpleados();
    await waitFor(() => {
      expect(screen.getByText('Carlos Méndez')).toBeInTheDocument();
      expect(screen.getByText('Ana López')).toBeInTheDocument();
    });
  });

  it('muestra el campo de búsqueda', async () => {
    renderEmpleados();
    await waitFor(() => expect(screen.getByPlaceholderText(/buscar por nombre/i)).toBeInTheDocument());
  });

  it('muestra el filtro de estados', async () => {
    renderEmpleados();
    await waitFor(() => expect(screen.getByDisplayValue(/todos/i)).toBeInTheDocument());
  });
});
