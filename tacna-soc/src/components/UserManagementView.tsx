import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Lock, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  KeyRound,
  Edit2,
  Trash2,
  Sliders,
  History,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Check
} from 'lucide-react';
import { SystemUser } from '../types';

interface UserManagementViewProps {
  users: SystemUser[];
  onOpenNewUserModal: () => void;
  onToggleUserStatus: (userId: string) => void;
  onUpdateRole: (userId: string, newRole: SystemUser['role']) => void;
  onViewUserAuditLogs: (userEmail: string) => void;
  onUpdatePassword?: (userId: string, newPassword: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onOpenNewUserModal,
  onToggleUserStatus,
  onUpdateRole,
  onViewUserAuditLogs,
  onUpdatePassword
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Todos');
  const [passwordModalUser, setPasswordModalUser] = useState<SystemUser | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showPasswordVal, setShowPasswordVal] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const roles = ['Todos', 'Super Admin', 'Security Analyst', 'Auditor', 'Operator'];

  const filteredUsers = (users || []).filter(u => {
    const term = (searchTerm || '').toLowerCase();
    const name = String(u?.name || '').toLowerCase();
    const email = String(u?.email || '').toLowerCase();
    const dept = String(u?.department || '').toLowerCase();

    const matchesSearch = 
      name.includes(term) ||
      email.includes(term) ||
      dept.includes(term);

    const matchesRole = selectedRole === 'Todos' || u?.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header & Create User Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight">
              Administración de Usuarios y Permisos
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-50 text-red-700 border border-red-200 font-semibold">
              RBAC SOC
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Gestión centralizada de identidades, perfiles de analistas, roles y control de acceso multifactor (MFA).
          </p>
        </div>

        <button
          onClick={onOpenNewUserModal}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Crear Usuario</span>
        </button>
      </div>

      {/* Role Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Super Admins</span>
            <span className="font-mono text-xl font-bold text-slate-900 mt-0.5 block">1</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <KeyRound className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Analistas Sec</span>
            <span className="font-mono text-xl font-bold text-slate-800 mt-0.5 block">2</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Auditores Gov</span>
            <span className="font-mono text-xl font-bold text-slate-800 mt-0.5 block">1</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Operadores N1</span>
            <span className="font-mono text-xl font-bold text-slate-800 mt-0.5 block">1</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo o departamento..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`
                px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer
                ${selectedRole === r 
                  ? 'bg-red-600 text-white font-semibold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }
              `}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Usuario / Identidad</th>
                <th className="py-3 px-3">Rol Asignado</th>
                <th className="py-3 px-3">Departamento / Área</th>
                <th className="py-3 px-3 text-center">MFA 2FA</th>
                <th className="py-3 px-3">Último Acceso / IP</th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center font-bold text-xs text-red-700 shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-slate-900 block">
                          {user.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <select
                      value={user.role}
                      onChange={(e) => onUpdateRole(user.id, e.target.value as SystemUser['role'])}
                      className="font-mono text-xs px-2 py-1 rounded border border-slate-300 bg-slate-50 text-slate-800 cursor-pointer focus:outline-none focus:border-red-500"
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Security Analyst">Security Analyst</option>
                      <option value="Auditor">Auditor</option>
                      <option value="Operator">Operator</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-3 text-slate-700 font-sans">
                    {user.department}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    {user.twoFactorEnabled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Habilitado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-medium">
                        <XCircle className="w-3 h-3 text-red-600" /> Desactivado
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="text-xs text-slate-800 font-mono block">
                      {user.lastLogin}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {user.ipAddress}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => onToggleUserStatus(user.id)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        user.status === 'Activo' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      }`}
                      title="Click para cambiar estado"
                    >
                      {user.status}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setPasswordModalUser(user);
                          setNewPasswordVal(user.password || '');
                          setShowPasswordVal(false);
                          setPasswordSuccess(false);
                        }}
                        title="Gestionar / Restablecer Contraseña"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onViewUserAuditLogs(user.email)}
                        title="Ver traza de auditoría de este usuario"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Management Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600/40 border border-red-500/50 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-red-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Gestionar Contraseña</h3>
                  <p className="text-[11px] text-slate-300 font-mono">{passwordModalUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-500 font-medium block">Usuario Seleccionado:</span>
                <p className="font-bold text-slate-900 text-sm">{passwordModalUser.name}</p>
                <p className="text-slate-600 font-mono text-[11px]">Rol: {passwordModalUser.role} · Estado: {passwordModalUser.status}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold block">
                    Nueva Contraseña de Acceso:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
                      let generated = 'Tacna#';
                      for (let i = 0; i < 6; i++) {
                        generated += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      generated += '2026!';
                      setNewPasswordVal(generated);
                      setShowPasswordVal(true);
                    }}
                    className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generar Segura</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPasswordVal ? 'text' : 'password'}
                    value={newPasswordVal}
                    onChange={(e) => setNewPasswordVal(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono text-xs focus:border-red-500 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordVal(!showPasswordVal)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPasswordVal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-xs">¡Contraseña actualizada exitosamente!</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer font-medium"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newPasswordVal || newPasswordVal.length < 6) return;
                    if (onUpdatePassword) {
                      onUpdatePassword(passwordModalUser.id, newPasswordVal);
                    }
                    setPasswordSuccess(true);
                    setTimeout(() => {
                      setPasswordModalUser(null);
                    }, 1200);
                  }}
                  disabled={!newPasswordVal || newPasswordVal.length < 6}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Guardar Contraseña</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
