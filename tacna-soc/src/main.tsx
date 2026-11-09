import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthUser } from './components/LoginView';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

const AUTH_STORAGE_KEY = 'tacna_soc_auth_user';

export const PUBLIC_GUEST_USER: AuthUser = {
  email: 'evaluador.publico@tacnasoc.pe',
  name: 'Evaluador Invitado (Modo Público)',
  role: 'Security Analyst'
};

function Root() {
  const [authUser, setAuthUser] = useState<AuthUser>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!saved) return PUBLIC_GUEST_USER;
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.email && parsed.role) {
        return parsed as AuthUser;
      }
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return PUBLIC_GUEST_USER;
    } catch {
      return PUBLIC_GUEST_USER;
    }
  });

  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error guardando sesión:', e);
    }
  };

  const handleLogout = () => {
    setAuthUser(PUBLIC_GUEST_USER);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Error eliminando sesión:', e);
    }
  };

  return (
    <App
      authUser={authUser}
      onLoginUser={handleLogin}
      onLogout={handleLogout}
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <Root />
  </ErrorBoundary>
);
