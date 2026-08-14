'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, ROLE_REDIRECTS } from '@/store/useAuthStore';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { SigoLogoMark } from '@/components/ui/SigoLogo';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, initAuth, currentUser, isLoading } = useAuthStore();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isAuthenticated && currentUser && !isLoading) {
      const redirectUrl = ROLE_REDIRECTS[currentUser.rol.nombre] || '/dashboard';
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, currentUser, router, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }
    
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    
    if (!result.success) {
      setError(result.error || 'Credenciales incorrectas');
      toast.error('Error de autenticación', result.error || 'Verifica tus datos');
    } else {
      toast.success('¡Bienvenido!', 'Sesión iniciada correctamente');
      router.replace(result.redirectTo || '/dashboard');
    }
  };

  // If we are checking auth state, we can show a full screen loader or just wait
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 size={48} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full bg-blue-700/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg shadow-black/30 mb-4">
            <SigoLogoMark size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white">SIGO</h1>
          <p className="text-blue-300 mt-1 text-sm">Sistema de Gestión de Obra</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Iniciar Sesión</h2>
          <p className="text-slate-400 text-sm mb-6">Ingresa tus credenciales para acceder</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@sigo.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-sky-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 SIGO · Sistema de Gestión Integral de Obra
        </p>
      </div>
    </div>
  );
}
