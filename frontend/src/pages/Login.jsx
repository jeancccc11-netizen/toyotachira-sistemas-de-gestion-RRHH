import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4">
            <LogIn size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">SI-GHR</h1>
          <p className="text-gray-400 text-sm mt-1">
            Sistema Integral de Gestión de Recursos Humanos
          </p>
          <p className="text-gray-500 text-xs mt-1">Toyotachira S.A.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Iniciar Sesión</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Usuario
              </label>
              <input type="text" value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                  focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Ingrese su usuario" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <input type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                  focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Ingrese su contraseña" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium
                hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          © 2026 Toyotachira S.A. — Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
