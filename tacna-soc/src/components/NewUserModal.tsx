import React, { useState } from 'react';
import { X, UserPlus, Shield, KeyRound, Lock, Eye, EyeOff, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { SystemUser } from '../types';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: Omit<SystemUser, 'id' | 'lastLogin' | 'ipAddress' | 'createdAt'>) => void;
}

export const NewUserModal: React.FC<NewUserModalProps> = ({ isOpen, onClose, onAddUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<SystemUser['role']>('Security Analyst');
  const [department, setDepartment] = useState('Equipo de Respuesta a Incidentes (CSIRT)');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let generated = 'Tacna#';
    for (let i = 0; i < 6; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    generated += '2026!';
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setErrorMsg('');
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setShowPassword(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Por favor completa el nombre y correo del usuario.');
      return;
    }

    if (!password) {
      setErrorMsg('Debes asignar una contraseña para que el usuario pueda iniciar sesión.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    onAddUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      role,
      department: department.trim() || 'Centro de Operaciones de Seguridad',
      status: 'Activo',
      twoFactorEnabled
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/40 border border-red-500/50 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-red-300" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">
                Registrar Nuevo Operador / Usuario del SOC
              </h3>
              <p className="text-[11px] text-slate-300 font-mono">
                Asignación de credenciales y perfil RBAC
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-slate-700 block mb-1 font-semibold">
              Nombre Completo y Cargo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Ing. Roberto Mendoza (Especialista Forense)"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-semibold">
              Correo Electrónico Institucional (Usuario de Login) *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="r.mendoza@regiontacna.gob.pe"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none font-mono transition-all"
            />
          </div>

          {/* Credentials section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-600" />
                Credenciales de Acceso al Sistema
              </span>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Generar Segura</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 block mb-1 font-medium text-[11px]">
                  Contraseña Inicial *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-3 pr-8 text-slate-900 font-mono text-xs focus:border-red-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium text-[11px]">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repetir contraseña"
                    className={`w-full bg-white border rounded-lg py-2 pl-3 pr-8 text-slate-900 font-mono text-xs focus:outline-none ${
                      confirmPassword && confirmPassword !== password 
                        ? 'border-red-400 focus:border-red-500 bg-red-50/30' 
                        : 'border-slate-300 focus:border-red-500'
                    }`}
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Esta clave permitirá al usuario ingresar inmediatamente al SOC desde la pantalla de inicio de sesión.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 block mb-1 font-semibold">
                Rol en el SOC
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as SystemUser['role'])}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-red-500 focus:outline-none font-mono"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Security Analyst">Security Analyst</option>
                <option value="Auditor">Auditor</option>
                <option value="Operator">Operator</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 block mb-1 font-semibold">
                Departamento / Área
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Área de Seguridad"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="font-semibold block text-slate-900">Exigir Autenticación en Dos Pasos (2FA Obligatorio)</span>
                <span className="text-[11px] text-slate-500">Envío de código de activación TOTP al correo en el primer inicio.</span>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-red-600/20 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Crear Cuenta con Contraseña</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
