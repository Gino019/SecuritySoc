import React from 'react';
import { 
  LayoutDashboard,
  Zap, 
  ShieldAlert, 
  BarChart3, 
  SlidersHorizontal,
  ShieldCheck,
  LogOut,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';
import { NavigationTab, SystemUser } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  currentUser: SystemUser;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  allowedTabs?: NavigationTab[];
  onLogout?: () => void;
  vulnCount?: number;
  isGuest?: boolean;
  onOpenLoginModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  isOpenMobile,
  onCloseMobile,
  allowedTabs,
  onLogout,
  vulnCount = 18,
  isGuest = false,
  onOpenLoginModal
}) => {
  const isAllowed = (tab: NavigationTab) => !allowedTabs || allowedTabs.includes(tab);

  // 4 vistas principales estructuradas: Dashboard KPIs, Escáner Web, Taxonomía & OWASP, Reportes BI
  const navItems = [
    { 
      id: 'dashboard' as NavigationTab, 
      label: 'Dashboard (Gráficos)', 
      icon: LayoutDashboard, 
      badge: 'KPIs',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200' 
    },
    { 
      id: 'scanner' as NavigationTab, 
      label: 'Escáner Web', 
      icon: Zap, 
      badge: 'Live',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200' 
    },
    { 
      id: 'vulnerabilities' as NavigationTab, 
      label: 'Taxonomía & OWASP', 
      icon: ShieldAlert, 
      badge: `${vulnCount} CVEs`,
      badgeColor: 'bg-red-100 text-red-700 border-red-200' 
    },
    { 
      id: 'reports' as NavigationTab, 
      label: 'Reportes BI', 
      icon: BarChart3, 
      badge: '6 Reportes',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200' 
    },
  ];

  // Helper para detectar si la pestaña actual coincide con una sección o sus alias
  const isTabActive = (itemTab: NavigationTab) => {
    if (currentTab === itemTab) return true;
    if (itemTab === 'dashboard' && currentTab === 'websites') {
      return true;
    }
    if (itemTab === 'scanner' && (currentTab === 'evaluaciones' || currentTab === 'evaluations')) {
      return true;
    }
    if (itemTab === 'admin' && (currentTab === 'settings' || currentTab === 'user-management' || currentTab === 'audit-logs' || currentTab === 'data-sources' || currentTab === 'guide')) {
      return true;
    }
    return false;
  };

  const handleNavClick = (tabId: NavigationTab) => {
    onSelectTab(tabId);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-full w-[260px] bg-white border-r border-slate-200 flex flex-col py-6 z-50 transition-transform duration-200 ease-in-out shadow-sm
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header with White + Crimson Red - Clic para ir al Menú Principal */}
        <button
          onClick={() => handleNavClick('dashboard')}
          className="w-full px-5 mb-6 flex items-center gap-3 text-left cursor-pointer hover:opacity-85 transition-opacity group focus:outline-none"
          title="Ir al Menú Principal (Dashboard)"
        >
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center relative shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-sans font-bold text-[17px] text-slate-900 tracking-tight leading-snug truncate group-hover:text-red-700 transition-colors">
              Tacna SOC
            </h1>
            <p className="font-mono text-[10px] text-red-600 font-bold uppercase tracking-wider flex items-center gap-1">
              <span>PENTEST CORE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            </p>
          </div>
        </button>

        {/* Primary Navigation List: 3 Secciones Clave estilo PentestNet */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          <div className="px-3 py-1 font-mono text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Flujo de Operación
          </div>

          {navItems.filter(item => isAllowed(item.id)).map((item) => {
            const Icon = item.icon;
            const isActive = isTabActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 text-left cursor-pointer
                  ${isActive 
                    ? 'text-red-700 bg-red-50/90 border-l-4 border-red-600 shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }
                `}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold border ${item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Info Box */}
          <div className="pt-4 px-1">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Modo DAST &amp; Gemini 2.0</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Escaneo perimetral continuo sobre 150 activos institucionales de Tacna con análisis automático de remediación.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Admin / Ajustes Hub & User Card */}
        <div className="px-3 pt-3 border-t border-slate-200 space-y-2 mt-auto">
          {/* Botón Discreto de Administración / Gobernanza (Solo usuarios autenticados con permiso) */}
          {!isGuest && isAllowed('admin') && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`
                w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer
                ${isTabActive('admin') 
                  ? 'text-slate-900 bg-slate-200/90 border-l-4 border-slate-800 font-bold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }
              `}
            >
              <div className="flex items-center gap-2.5 truncate">
                <SlidersHorizontal className={`w-4 h-4 shrink-0 ${isTabActive('admin') ? 'text-slate-900' : 'text-slate-400'}`} />
                <span className="truncate">Ajustes &amp; Admin</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                Hub
              </span>
            </button>
          )}

          {/* User profile card when authenticated */}
          {!isGuest && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {currentUser.name
                  ? currentUser.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
                  : 'SO'}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-mono text-slate-500 truncate">{currentUser.role}</span>
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Cerrar sesión"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
