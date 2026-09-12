import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Layout from '../src/components/Layout';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';

vi.mock('../src/api/client', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
}));

const renderLayout = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ToastProvider>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
};

describe('Layout Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-jwt-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, username: 'admin', rol: 'admin' }));
  });

  it('muestra el nombre del sistema', () => {
    renderLayout();
    expect(screen.getByText('SI-GHR')).toBeInTheDocument();
    expect(screen.getByText('Toyotachira S.A.')).toBeInTheDocument();
  });

  it('muestra los 7 módulos del sidebar', () => {
    renderLayout();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Empleados')).toBeInTheDocument();
    expect(screen.getByText('Departamentos')).toBeInTheDocument();
    expect(screen.getByText('Exámenes')).toBeInTheDocument();
    expect(screen.getByText('Vacaciones')).toBeInTheDocument();
    expect(screen.getByText('Urosalud')).toBeInTheDocument();
    expect(screen.getByText('Nómina')).toBeInTheDocument();
  });

  it('muestra el usuario logueado', () => {
    renderLayout();
    const admins = screen.getAllByText(/admin/i);
    expect(admins.length).toBeGreaterThanOrEqual(1);
  });

  it('muestra el botón de salir', () => {
    renderLayout();
    expect(screen.getByText('Salir')).toBeInTheDocument();
  });
});
