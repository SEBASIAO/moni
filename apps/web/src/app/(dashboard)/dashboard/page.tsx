import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      <p className="mt-2 text-gray-600">Bienvenido a tu panel de control.</p>
    </main>
  );
}
