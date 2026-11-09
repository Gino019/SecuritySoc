import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Tacna SOC ErrorBoundary capturó un error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('tacna_soc_active_tab');
      localStorage.removeItem('tacna_soc_auth_user');
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/40 to-slate-100 text-slate-900 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-3xl p-8 text-center shadow-2xl shadow-red-950/10 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200 shadow-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-slate-900">Sesión Protegida del SOC</h2>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              El sistema detectó un estado inconsistente en la memoria del navegador. Pulsa el botón inferior para restablecer la sesión limpia e ingresar al SOC.
            </p>
            {this.state.error && (
              <pre className="text-[11px] text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 mb-5 text-left overflow-x-auto font-mono max-h-28">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm shadow-lg shadow-red-600/30 active:scale-[0.99]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Limpiar Estado y Recargar</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
