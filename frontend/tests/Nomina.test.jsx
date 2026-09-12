import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Nomina from '../src/pages/Nomina';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';

const mockPeriodos = [
  { id: 1, quincena: 1, mes: 8, anio: 2026, estatus: 'Aprobada' },
];
const mockDetalles = [
  { id: 1, nombre_completo: 'Carlos Méndez', departamento: 'Ventas', sueldo_base: 4500, total_asignaciones: 5200, total_deducciones: 409.5, neto_a_pagar: 4790.5 },
];
const mockTotal = { total_empleados: 1, total_asignaciones: 5200, total_neto: 4790.5 };

vi.mock('../src/api/client', () => ({
  default: {
    get: vi.fn((url) => {
      if (url.includes('/nomina/periodos') && !url.includes('/detalles') && !url.includes('/historial')) return Promise.resolve({ data: mockPeriodos });
      if (url.includes('/detalles')) return Promise.resolve({ data: mockDetalles });
      if (url.includes('/total')) return Promise.resolve({ data: mockTotal });
      return Promise.resolve({ data: [] });
    }),
  },
}));

const renderNomina = () => render(
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        <Nomina />
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
);

describe('Nomina Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-jwt-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, username: 'admin', rol: 'admin' }));
  });

  it('muestra el título Nómina', async () => {
    renderNomina();
    await waitFor(() => expect(screen.getByText('Nómina')).toBeInTheDocument());
  });

  it('muestra botón nuevo período', async () => {
    renderNomina();
    await waitFor(() => expect(screen.getByText(/nuevo período/i)).toBeInTheDocument());
  });

  it('muestra botón exportar Excel', async () => {
    renderNomina();
    await waitFor(() => expect(screen.getByText(/exportar/i)).toBeInTheDocument());
  });

  it('carga períodos', async () => {
    renderNomina();
    await waitFor(() => expect(screen.getByText(/1° Q · 8\/2026/)).toBeInTheDocument());
  });

  it('muestra detalles de nómina', async () => {
    renderNomina();
    await waitFor(() => expect(screen.getByText('Carlos Méndez')).toBeInTheDocument());
  });
});
