import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  User as UserIcon, 
  Menu, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  LogOut, 
  Sliders, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { SystemUser } from '../types';

interface TopHeaderProps {
  currentUser: SystemUser;
  onToggleMobileMenu: () => void;
  onSelectUserRole: (role: 'Super Admin' | 'Security Analyst' | 'Auditor' | 'Operator') => void;
  onOpenAuditLogs: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onLogout: () => void;
  onOpenGuide?: () => void;
  isGuest?: boolean;
  onOpenLoginModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  onToggleMobileMenu,
  onSelectUserRole,
  onOpenAuditLogs,
  searchQuery,
  onSearchChange,
  onLogout,
  onOpenGuide,
  isGuest = false,
  onOpenLoginModal
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Alerta Crítica: OpenSSH RCE detectado',
      detail: 'Afecta a 3 nodos institucionales principales',
      time: 'Hace 8 min',
      type: 'critical'
    },
    {
      id: 'notif-2',
      title: 'Escaneo DAST completado',
      detail: 'api.produccion.tacna.io analizado (2 vulns críticas)',
      time: 'Hace 24 min',
      type: 'warning'
    },
    {
      id: 'notif-3',
      title: 'Sesión de Administrador auditada',
      detail: 'Checksum SHA-256 verificado en registro inmutable',
      time: 'Hace 1 hora',
      type: 'info'
    }
  ];

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-260px)] h-16 bg-white/95 border-b border-slate-200 flex justify-between items-center px-4 md:px-8 z-30 shadow-xs backdrop-blur-md">
      {/* Left side: Hamburger on mobile, SOC title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-sans text-xl font-black text-slate-900 tracking-tight">
            Tacna <span className="text-red-600">SOC</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-red-50 text-red-700 border border-red-200 font-bold">
            LIVE SHIELD
          </span>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="relative hidden sm:block max-w-md w-72 lg:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por CVE, sitio web, IP o evento..."
          className="w-full bg-slate-50 border border-slate-300/80 rounded-full py-1.5 pl-10 pr-4 text-xs font-sans text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all shadow-xs"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 relative">
        {/* Help & Guide Quick Link */}
        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors text-xs font-semibold cursor-pointer"
            title="Abrir Guía de Uso del Sistema"
          >
            <BookOpen className="w-4 h-4 text-red-600" />
            <span>Guía</span>
          </button>
        )}

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
            title="Notificaciones del SOC"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Notificaciones de Seguridad
                </span>
                <span className="text-[10px] font-mono bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                  3 Alertas
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors text-xs">
                    <div className="flex items-start gap-2.5">
                      {n.type === 'critical' && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                      {n.type === 'warning' && <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                      {n.type === 'info' && <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{n.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{n.detail}</p>
                        <p className="font-mono text-[10px] text-slate-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                <button 
                  onClick={() => {
                    setShowNotifications(false);
                    onOpenAuditLogs();
                  }}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  Ver todos los logs de auditoría <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

        {/* MODO PÚBLICO / INVITADO */}
        {isGuest ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Modo Público</span>
            </span>

            {onOpenLoginModal && (
              <button
                id="topheader-login-btn"
                onClick={onOpenLoginModal}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-xs hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Iniciar Sesión / Registrarse</span>
              </button>
            )}
          </div>
        ) : (
          /* MODO AUTENTICADO CON CUENTA REAL */
          <div className="flex items-center gap-2.5">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">{currentUser.name}</span>
              <span className="text-[10px] font-mono text-red-600 font-bold">{currentUser.role}</span>
            </div>

            {/* User Profile Avatar & Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Perfil y permisos de usuario"
              >
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {currentUser.name
                    ? currentUser.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
                    : <UserIcon className="w-4 h-4 text-white" />}
                </div>
              </button>

              {/* User Profile Switcher Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="pb-3 border-b border-slate-100">
                    <p className="font-bold text-sm text-slate-900">{currentUser.name}</p>
                    <p className="text-xs font-mono text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-50 text-red-700 border border-red-200 font-semibold">
                        Rol: {currentUser.role}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Autenticado
                      </span>
                    </div>
                  </div>

                  {/* Role switcher simulation */}
                  <div className="py-2.5">
                    <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                      Cambiar Rol Activo (Simulación):
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['Super Admin', 'Security Analyst', 'Auditor', 'Operator'] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            onSelectUserRole(r);
                            setShowProfileMenu(false);
                          }}
                          className={`
                            text-[11px] font-mono py-1 px-2 rounded-lg border text-left transition-colors truncate cursor-pointer
                            ${currentUser.role === r 
                              ? 'bg-red-600 border-red-600 text-white font-bold' 
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }
                          `}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAuditLogs();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-red-600" />
                      <span>Mi Registro de Auditoría</span>
                    </button>
                    {onOpenGuide && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenGuide();
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-red-600" />
                        <span>Guía y Manual de Usuario</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión (Volver a Modo Público)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Botón Directo "Cerrar Sesión" */}
            <button
              onClick={onLogout}
              title="Cerrar sesión y volver al Modo Público"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
