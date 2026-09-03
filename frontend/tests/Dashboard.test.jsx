import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Dashboard from '../src/pages/Dashboard';
import { AuthProvider } from '../src/context/AuthContext';

vi.mock('../src/api/client', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        empleados: { total: 12, activos: 10, vacaciones: 1, reposo: 1 },
        solicitudes_pendientes: 3,
        reposos_activos: 2,
        polizas: { total: 7, prima_total: 840.50 },
        ultima_nomina: { id: 1, quincena: 1, mes: 8, anio: 2026, estatus: 'Aprobada' },
      },
    }),
  },
}));

const renderDashboard = () => render(
  <BrowserRouter><AuthProvider><Dashboard /></AuthProvider></BrowserRouter>
);

describe('Dashboard Component', () => {
  beforeEach(() => { localStorage.setItem('token', 'fake-token'); });

  it('muestra el título', async () => {
    renderDashboard();
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument());
  });

  it('muestra total empleados', async () => {
    renderDashboard();
    await waitFor(() => expect(screen.getByText('12')).toBeInTheDocument());
  });

  it('muestra activos', async () => {
    renderDashboard();
    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument());
  });

  it('muestra prima Urosalud', async () => {
    renderDashboard();
    await waitFor(() => expect(screen.getByText('840.50 Bs')).toBeInTheDocument());
  });

  it('muestra accesos rápidos', async () => {
    renderDashboard();
    await waitFor(() => expect(screen.getByText('Accesos Rápidos')).toBeInTheDocument());
  });
});
