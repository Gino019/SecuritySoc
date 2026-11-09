import React, { useState } from 'react';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle, 
  Loader2, 
  UserPlus, 
  Zap, 
  CheckCircle2, 
  User, 
  Building, 
  ArrowRight, 
  Sparkles, 
  KeyRound, 
  Globe,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { supabase, registerNewUser, logGuestAccess } from '../supabase';

export const DEMO_USERS = [
  { email: 'admin@tacnasoc.pe',    password: 'Admin2026!',    name: 'Carlos Mendoza',      role: 'Super Admin'        as const, status: 'Activo' },
  { email: 'analyst@tacnasoc.pe',  password: 'Analyst2026!',  name: 'Ana Torres',           role: 'Security Analyst'   as const, status: 'Activo' },
  { email: 'auditor@tacnasoc.pe',  password: 'Auditor2026!',  name: 'Luis Quispe',          role: 'Auditor'            as const, status: 'Activo' },
  { email: 'operator@tacnasoc.pe', password: 'Operator2026!', name: 'María Flores',         role: 'Operator'           as const, status: 'Activo' },
  { email: 'usher.dhr1@gmail.com', password: 'Admin2026!',    name: 'Usher DHR',           role: 'Super Admin'        as const, status: 'Activo' },
];

export type AuthUser = {
  email: string;
  name: string;
  role: 'Super Admin' | 'Security Analyst' | 'Auditor' | 'Operator';
};

interface LoginViewProps {
  onLogin: (user: AuthUser) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export function LoginView({ onLogin, onClose, isModal = false }: LoginViewProps) {
  // Navigation between Login and Register
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw]     = useState(false);
  const [loginError, setLoginError]       = useState('');
  const [loginLoading, setLoginLoading]   = useState(false);

  // Register form state
  const [regName, setRegName]             = useState('');
  const [regEmail, setRegEmail]           = useState('');
  const [regPassword, setRegPassword]     = useState('');
  const [regConfirmPw, setRegConfirmPw]   = useState('');
  const [regDepartment, setRegDepartment] = useState('Centro de Operaciones de Seguridad');
  const [regRole, setRegRole]             = useState<'Security Analyst' | 'Operator' | 'Auditor'>('Security Analyst');
  const [showRegPw, setShowRegPw]         = useState(false);
  const [regError, setRegError]           = useState('');
  const [regLoading, setRegLoading]       = useState(false);

  // Quick Guest Mode state
  const [guestLoading, setGuestLoading]   = useState(false);

  // ──────────────────────────────────────────────────────────────────────────
  // 1. INICIAR SESIÓN
  // ──────────────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Por favor completa todos los campos.');
      return;
    }
    setLoginLoading(true);

    const emailTrimmed = loginEmail.trim().toLowerCase();

    // 1. Verificación directa contra Supabase
    try {
      const { data, error } = await supabase
        .from('system_users')
        .select('*')
        .ilike('email', emailTrimmed)
        .limit(1);

      if (!error && data && data.length > 0) {
        const dbUser = data[0];

        if (dbUser.status === 'Suspendido') {
          setLoginError('Esta cuenta se encuentra suspendida por el Administrador.');
          setLoginLoading(false);
          return;
        }

        if (dbUser.password) {
          if (dbUser.password !== loginPassword) {
            setLoginError('Contraseña incorrecta. Por favor verifica tus credenciales.');
            setLoginLoading(false);
            return;
          }
          setLoginLoading(false);
          onLogin({ email: dbUser.email, name: dbUser.name, role: dbUser.role });
          return;
        }
      }
    } catch (e) {
      console.warn('Error verificando en Supabase, aplicando fallback local:', e);
    }

    // 2. Búsqueda en usuarios registrados localmente (localStorage)
    let registeredUsers: Array<{ email: string; password?: string; name: string; role: any; status?: string }> = [];
    try {
      const stored = localStorage.getItem('sivit_registered_users');
      if (stored) {
        registeredUsers = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error leyendo usuarios locales:', e);
    }

    const registeredMatch = registeredUsers.find(
      u => u.email?.toLowerCase() === emailTrimmed
    );

    // 3. Búsqueda en DEMO_USERS preconfigurados
    const demoMatch = DEMO_USERS.find(
      u => u.email?.toLowerCase() === emailTrimmed
    );

    const found = registeredMatch || demoMatch;

    if (!found) {
      setLoginError('Usuario no encontrado en el sistema SOC. Si es tu primera vez, puedes registrarte en la pestaña superior o ingresar mediante Acceso Rápido.');
      setLoginLoading(false);
      return;
    }

    if (found.status === 'Suspendido') {
      setLoginError('Esta cuenta se encuentra suspendida por el Administrador.');
      setLoginLoading(false);
      return;
    }

    if (found.password !== loginPassword) {
      setLoginError('Contraseña incorrecta. Por favor verifica tus credenciales.');
      setLoginLoading(false);
      return;
    }

    setLoginLoading(false);
    onLogin({ email: found.email, name: found.name, role: found.role });
    if (onClose) onClose();
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 2. REGISTRARSE (CREAR CUENTA)
  // ──────────────────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirmPw) {
      setRegError('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPw) {
      setRegError('Las contraseñas no coinciden. Verifícalas cuidadosamente.');
      return;
    }

    setRegLoading(true);

    const result = await registerNewUser({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
      department: regDepartment.trim() || 'Ciberseguridad Tacna'
    });

    setRegLoading(false);

    if (!result.success) {
      setRegError(result.error || 'No se pudo completar el registro. Intenta nuevamente.');
      return;
    }

    // Ingreso automático tras registro exitoso
    if (result.user) {
      onLogin({
        email: result.user.email,
        name: result.user.name,
        role: result.user.role
      });
      if (onClose) onClose();
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ACCESO RÁPIDO SIN REGISTRO (MODO EVALUADOR / ESCANEO PÚBLICO)
  // ──────────────────────────────────────────────────────────────────────────
  const handleGuestAccess = async () => {
    setGuestLoading(true);
    try {
      // Registrar evento en bitácora de auditoría SHA-256 en Supabase
      await logGuestAccess();
    } catch (e) {
      console.warn('Error registrando auditoría de invitado:', e);
    }

    // Iniciar sesión instantáneamente con rol Security Analyst
    onLogin({
      email: 'evaluador.publico@tacnasoc.pe',
      name: 'Evaluador Invitado (Modo Público)',
      role: 'Security Analyst'
    });
    if (onClose) onClose();
  };

  const mainContent = (
    <div className="relative w-full max-w-lg">
      {/* Cabecera / Identidad de Marca */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 shadow-xl shadow-red-600/25 mb-3 border border-red-500/30">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Tacna <span className="text-red-600">SOC</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1 font-medium">
          Centro de Operaciones de Seguridad e Inteligencia de Negocios · Región Tacna
        </p>
      </div>

      {/* Tarjeta Central con Selector de Pestañas */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-red-950/5 overflow-hidden p-6 md:p-8 relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-30 cursor-pointer"
            title="Cerrar y continuar en Modo Público"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {/* Pestañas de navegación Iniciar Sesión / Registrarse */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
              setRegError('');
            }}
            className={`
              py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer
              ${activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
              }
            `}
          >
            <Lock className="w-3.5 h-3.5 text-red-600" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setLoginError('');
              setRegError('');
            }}
            className={`
              py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer
              ${activeTab === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
              }
            `}
          >
            <UserPlus className="w-3.5 h-3.5 text-red-600" />
            <span>Registrarse</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold">Nuevo</span>
          </button>
        </div>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 1: FORMULARIO INICIAR SESIÓN                            */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'login' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="mb-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Acceso Institucional</h2>
                <p className="text-xs text-slate-500 mt-0.5">Ingresa tus credenciales verificadas en Supabase</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4" id="login-form">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="usuario@tacnasoc.pe"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="login-password"
                      type={showLoginPw ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-mono"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw(!showLoginPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-red-700 text-xs font-medium animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  id="login-submit"
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/30 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-xs cursor-pointer"
                >
                  {loginLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Verificando en Supabase...</>
                  ) : (
                    <><Shield className="w-4 h-4" /> Iniciar Sesión en el SOC</>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 2: FORMULARIO REGISTRARSE (CREAR CUENTA)                */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'register' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="mb-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Registro de Nuevo Analista</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Crea tu cuenta institucional. Los datos se persistirán en Supabase con hash SHA-256 en la bitácora.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3" id="register-form">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="Ing. Marco Rosales"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Correo electrónico institucional
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="marco.rosales@regiontacna.gob.pe"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showRegPw ? 'text' : 'password'}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Mínimo 6 carácteres"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-8 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPw(!showRegPw)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        {showRegPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Confirmar contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showRegPw ? 'text' : 'password'}
                        value={regConfirmPw}
                        onChange={e => setRegConfirmPw(e.target.value)}
                        placeholder="Repite la contraseña"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Entidad / Departamento
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={regDepartment}
                      onChange={e => setRegDepartment(e.target.value)}
                      placeholder="Gobierno Regional de Tacna / Ciberseguridad"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Rol en la plataforma (RBAC)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: 'Security Analyst' as const, label: 'Security Analyst', badge: 'Recomendado' },
                      { role: 'Operator' as const, label: 'Operator', badge: 'Monitoreo' },
                      { role: 'Auditor' as const, label: 'Auditor', badge: 'Solo Lectura' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setRegRole(item.role)}
                        className={`
                          p-2 rounded-xl border text-left transition-all cursor-pointer
                          ${regRole === item.role
                            ? 'bg-red-50/80 border-red-500 text-red-900 ring-1 ring-red-500'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }
                        `}
                      >
                        <span className="block font-bold text-[11px] truncate">{item.label}</span>
                        <span className="block text-[9px] font-mono text-slate-400 mt-0.5">{item.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {regError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-red-700 text-xs font-medium animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{regError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/30 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-xs cursor-pointer mt-2"
                >
                  {regLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Registrando en Supabase...</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Crear Cuenta e Ingresar</>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* OPCIÓN LIMPIA: CONTINUAR AL ESCÁNER PÚBLICO                 */}
          {/* ──────────────────────────────────────────────────────────── */}
          <div className="pt-5 mt-6 border-t border-slate-200 text-center space-y-3">
            <button
              id="continue-public-scanner-btn"
              type="button"
              disabled={guestLoading}
              onClick={() => {
                if (onClose) {
                  onClose();
                } else {
                  handleGuestAccess();
                }
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all py-2.5 px-5 rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-slate-50 cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>Continuar al Escáner Público</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-mono">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Autenticación institucional · Conexión directa a Supabase</span>
            </div>
          </div>
        </div>
      </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
        <div className="fixed inset-0" onClick={onClose} />
        <div className="relative z-10 w-full max-w-lg my-8 animate-in fade-in zoom-in-95 duration-150">
          {mainContent}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] rounded-full bg-red-500/10 blur-[110px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[110px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-red-300/40 to-transparent" />
      </div>
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{ backgroundImage: 'linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)', backgroundSize: '36px 36px' }} 
      />
      {mainContent}
    </div>
  );
}
