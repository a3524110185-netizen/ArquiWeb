'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registroService, RegistroData } from '@/lib/services/registro';
import { empresasService, EmpresaOption } from '@/lib/services/empresas';
import { departamentosService, DepartamentoApi } from '@/lib/services/departamentos';
import { extractErrorMessage, extractFieldErrors } from '@/lib/services/api';
import { useToast } from '@/components/ui/Toast';
import { SigoLogoMark } from '@/components/ui/SigoLogo';
import {
  User, Mail, Phone, Lock, Building2, Users, Eye, EyeOff,
  Loader2, ChevronDown,
} from 'lucide-react';

const emptyForm = {
  nombre: '', email: '', telefono: '', password: '', password_confirmation: '',
  empresa_id: '', departamento_id: '',
};

export default function RegistroPage() {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoApi[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    empresasService.getEmpresasPublicas()
      .then(setEmpresas)
      .catch(() => toast.error('Error', 'No se pudieron cargar las empresas'))
      .finally(() => setLoadingEmpresas(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!form.empresa_id) {
      setDepartamentos([]);
      return;
    }
    setLoadingDepartamentos(true);
    departamentosService.getDepartamentos(true, form.empresa_id)
      .then(setDepartamentos)
      .catch(() => toast.error('Error', 'No se pudieron cargar los departamentos'))
      .finally(() => setLoadingDepartamentos(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.empresa_id]);

  const f = (field: keyof typeof emptyForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'empresa_id' ? { departamento_id: '' } : {}),
    }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'Ingresa tu nombre';
    if (!form.email.trim()) e.email = 'Ingresa tu correo';
    if (!form.password) e.password = 'Ingresa una contraseña';
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (!form.password_confirmation) e.password_confirmation = 'Confirma tu contraseña';
    else if (form.password !== form.password_confirmation) e.password_confirmation = 'Las contraseñas no coinciden';
    if (!form.empresa_id) e.empresa_id = 'Selecciona una empresa';
    if (!form.departamento_id) e.departamento_id = 'Selecciona un departamento';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: RegistroData = {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim() || undefined,
        password: form.password,
        password_confirmation: form.password_confirmation,
        empresa_id: Number(form.empresa_id),
        departamento_id: Number(form.departamento_id),
      };
      await registroService.registrar(payload);
      toast.success('Registro exitoso', 'Espera la aprobación del administrador.');
      router.push('/login');
    } catch (err) {
      setErrors(prev => ({ ...prev, ...extractFieldErrors(err) }));
      toast.error('Error de registro', extractErrorMessage(err, 'No se pudo completar el registro'));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all';
  const selectClass = 'w-full pl-10 pr-9 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 py-10">
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
          <h2 className="text-xl font-semibold text-white mb-1">Crear Cuenta</h2>
          <p className="text-slate-400 text-sm mb-6">Completa tus datos para solicitar acceso</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Nombre{<span className="text-red-400 ml-0.5">*</span>}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => f('nombre', e.target.value)}
                  placeholder="Tu nombre completo"
                  autoComplete="name"
                  className={inputClass}
                />
              </div>
              {errors.nombre && <p className="text-xs text-red-400 mt-1">{errors.nombre}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email<span className="text-red-400 ml-0.5">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => f('email', e.target.value)}
                  placeholder="usuario@sigo.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Teléfono</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.telefono}
                  onChange={e => f('telefono', e.target.value)}
                  placeholder="(555) 123 4567"
                  autoComplete="tel"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Contraseña<span className="text-red-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => f('password', e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Confirmar<span className="text-red-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    value={form.password_confirmation}
                    onChange={e => f('password_confirmation', e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password_confirmation && <p className="text-xs text-red-400 mt-1">{errors.password_confirmation}</p>}
              </div>
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Empresa<span className="text-red-400 ml-0.5">*</span>
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <select
                  value={form.empresa_id}
                  onChange={e => f('empresa_id', e.target.value)}
                  disabled={loadingEmpresas}
                  className={selectClass}
                >
                  <option value="" className="bg-slate-800">
                    {loadingEmpresas ? 'Cargando empresas...' : 'Selecciona una empresa'}
                  </option>
                  {empresas.map(emp => (
                    <option key={emp.id} value={emp.id} className="bg-slate-800">{emp.nombre}</option>
                  ))}
                </select>
                {loadingEmpresas
                  ? <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                  : <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                }
              </div>
              {errors.empresa_id && <p className="text-xs text-red-400 mt-1">{errors.empresa_id}</p>}
            </div>

            {/* Departamento */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Departamento<span className="text-red-400 ml-0.5">*</span>
              </label>
              <div className="relative">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <select
                  value={form.departamento_id}
                  onChange={e => f('departamento_id', e.target.value)}
                  disabled={!form.empresa_id || loadingDepartamentos}
                  className={selectClass}
                >
                  <option value="" className="bg-slate-800">
                    {!form.empresa_id
                      ? 'Selecciona primero una empresa'
                      : loadingDepartamentos ? 'Cargando departamentos...' : 'Selecciona un departamento'}
                  </option>
                  {departamentos.map(dep => (
                    <option key={dep.id} value={dep.id} className="bg-slate-800">{dep.nombre}</option>
                  ))}
                </select>
                {loadingDepartamentos
                  ? <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                  : <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                }
              </div>
              {errors.departamento_id && <p className="text-xs text-red-400 mt-1">{errors.departamento_id}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-sky-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
              {submitting ? 'Enviando solicitud...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 SIGO · Sistema de Gestión Integral de Obra
        </p>
      </div>
    </div>
  );
}
