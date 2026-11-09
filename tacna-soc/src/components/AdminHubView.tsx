import React, { useState } from 'react';
import { 
  Users, 
  ScrollText, 
  Database, 
  Settings, 
  BookOpen, 
  SlidersHorizontal
} from 'lucide-react';
import { SystemUser, DataSourceItem, AuditLogItem, NavigationTab } from '../types';
import { UserManagementView } from './UserManagementView';
import { DataSourcesView } from './DataSourcesView';
import { AuditLogsView } from './AuditLogsView';
import { SettingsView } from './SettingsView';
import { GuideView } from './GuideView';

export type AdminSubTab = 'users' | 'datasources' | 'audit' | 'settings' | 'guide';

interface AdminHubViewProps {
  users: SystemUser[];
  onOpenNewUserModal: () => void;
  onToggleUserStatus: (userId: string) => void;
  onUpdateRole: (userId: string, newRole: SystemUser['role']) => void;
  onViewUserAuditLogs: (userEmail: string) => void;
  onUpdatePassword?: (userId: string, newPassword: string) => void;
  dataSources: DataSourceItem[];
  onSyncSource: (sourceId: string) => void;
  onSyncAll: () => void;
  auditLogs: AuditLogItem[];
  filterActorEmail?: string | null;
  onClearActorFilter?: () => void;
  onSimulateEvent: () => void;
  onInspectLog: (log: AuditLogItem) => void;
  currentUser: SystemUser;
  onSaveSettingsNotification: (message: string) => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenNewScan: () => void;
  initialSubTab?: AdminSubTab;
}

export const AdminHubView: React.FC<AdminHubViewProps> = ({
  users,
  onOpenNewUserModal,
  onToggleUserStatus,
  onUpdateRole,
  onViewUserAuditLogs,
  onUpdatePassword,
  dataSources,
  onSyncSource,
  onSyncAll,
  auditLogs,
  filterActorEmail,
  onClearActorFilter,
  onSimulateEvent,
  onInspectLog,
  currentUser,
  onSaveSettingsNotification,
  onNavigateTab,
  onOpenNewScan,
  initialSubTab = 'users'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>(initialSubTab);

  const subTabs = [
    { id: 'users' as const, label: 'Usuarios & Roles', icon: Users, badge: `${users.length}` },
    { id: 'datasources' as const, label: 'Fuentes & Threat Intel', icon: Database, badge: 'NVD/NIST' },
    { id: 'audit' as const, label: 'Auditoría SHA-256', icon: ScrollText, badge: 'Inmutable' },
    { id: 'settings' as const, label: 'Ajustes & API Key', icon: Settings, badge: 'Config' },
    { id: 'guide' as const, label: 'Manual & Guía', icon: BookOpen, badge: 'Doc' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Hub Administrativo */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-md">
            <SlidersHorizontal className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Centro de Administración y Gobernanza SOC
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                Control Central
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Administración de accesos (RBAC), fuentes de ciberinteligencia, bitácora de auditoría SHA-256 y ajustes globales.
            </p>
          </div>
        </div>

        {/* Sub-Tabs Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer
                  ${isActive 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  isActive ? 'bg-red-100 text-red-700' : 'bg-slate-200/70 text-slate-500'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-View Content */}
      <div className="transition-all duration-150">
        {activeSubTab === 'users' && (
          <UserManagementView
            users={users}
            onOpenNewUserModal={onOpenNewUserModal}
            onToggleUserStatus={onToggleUserStatus}
            onUpdateRole={onUpdateRole}
            onViewUserAuditLogs={onViewUserAuditLogs}
            onUpdatePassword={onUpdatePassword}
          />
        )}

        {activeSubTab === 'datasources' && (
          <DataSourcesView
            dataSources={dataSources}
            onSyncSource={onSyncSource}
            onSyncAll={onSyncAll}
          />
        )}

        {activeSubTab === 'audit' && (
          <AuditLogsView
            logs={auditLogs}
            filterActor={filterActorEmail || undefined}
            onClearActorFilter={onClearActorFilter}
            onSimulateEvent={onSimulateEvent}
            onInspectLog={onInspectLog}
          />
        )}

        {activeSubTab === 'settings' && (
          <SettingsView
            currentUser={currentUser}
            onSaveSettingsNotification={onSaveSettingsNotification}
          />
        )}

        {activeSubTab === 'guide' && (
          <GuideView
            onNavigateTab={onNavigateTab}
            onOpenNewScan={onOpenNewScan}
          />
        )}
      </div>
    </div>
  );
};
