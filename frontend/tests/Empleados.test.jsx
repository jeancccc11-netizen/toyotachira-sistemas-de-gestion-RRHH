import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Empleados from '../src/pages/Empleados';
import { AuthProvider } from '../src/context/AuthContext';

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
      <AuthProvider>
        <Empleados />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Empleados Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-jwt-token');
  });

  it('renderiza el título de la página', async () => {
    renderEmpleados();
    expect(screen.getByText('Empleados')).toBeInTheDocument();
  });

  it('muestra el botón de nuevo empleado', () => {
    renderEmpleados();
    expect(screen.getByText(/nuevo empleado/i)).toBeInTheDocument();
  });

  it('carga y muestra la lista de empleados', async () => {
    renderEmpleados();
    await waitFor(() => {
      expect(screen.getByText('Carlos Méndez')).toBeInTheDocument();
      expect(screen.getByText('Ana López')).toBeInTheDocument();
    });
  });

  it('muestra el campo de búsqueda', () => {
    renderEmpleados();
    expect(screen.getByPlaceholderText(/buscar por nombre/i)).toBeInTheDocument();
  });

  it('muestra el filtro de estados', () => {
    renderEmpleados();
    expect(screen.getByDisplayValue(/todos/i)).toBeInTheDocument();
  });
});
