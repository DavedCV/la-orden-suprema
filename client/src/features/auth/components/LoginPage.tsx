import { LoginForm } from "./LoginForm";
import { Shield, Zap } from "lucide-react";

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orden-900 via-orden-800 to-orden-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gold-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-orden-800 p-4 rounded-full border-2 border-gold-500/30">
                <Shield className="h-12 w-12 text-gold-400" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gold-400 mb-2">
            La Orden Suprema
          </h1>

          <p className="text-orden-300 text-lg mb-2">
            Sistema de Gestión Profesional
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-orden-400">
            <Zap className="h-4 w-4" />
            <span>Acceso Seguro</span>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="card p-8 shadow-2xl border-orden-700/50">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-orden-100 text-center">
              Iniciar Sesión
            </h2>
            <p className="text-orden-400 text-center mt-2">
              Accede a tu cuenta para continuar
            </p>
          </div>

          <LoginForm />
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-4">
          <div className="border-t border-orden-700 pt-6">
            <p className="text-sm text-orden-500">
              © 2024 La Orden Suprema. Sistema de gestión profesional.
            </p>
          </div>

          {/* Security Features */}
          <div className="flex justify-center gap-8 text-xs text-orden-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Cifrado SSL</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Auth JWT</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>2FA Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-3/4 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}
