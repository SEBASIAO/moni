import type { Metadata } from 'next';

import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">Bienvenido</h1>
        <p className="mt-1 text-sm text-gray-600">Ingresa a tu cuenta</p>
      </div>
      <LoginForm />
    </div>
  );
}
