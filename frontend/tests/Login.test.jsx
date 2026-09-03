import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from '../src/pages/Login';
import { AuthProvider } from '../src/context/AuthContext';

vi.mock('../src/api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn().mockResolvedValue({ data: null }),
  },
}));

const renderLogin = () => render(
  <BrowserRouter>
    <AuthProvider><Login /></AuthProvider>
  </BrowserRouter>
);

describe('Login Component', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

  it('renderiza el formulario de login', () => {
    renderLogin();
    expect(screen.getByText('SI-GHR')).toBeInTheDocument();
    expect(screen.getByText('Toyotachira S.A.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('renderiza campos de entrada', () => {
    renderLogin();
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('muestra botón de submit', () => {
    renderLogin();
    const btn = screen.getByRole('button', { name: /iniciar sesión/i });
    expect(btn).toHaveAttribute('type', 'submit');
  });

  it('permite escribir en los campos', async () => {
    const user = userEvent.setup();
    renderLogin();
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'admin');
    expect(inputs[0]).toHaveValue('admin');
  });
});
