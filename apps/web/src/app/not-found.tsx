import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-primary">404</h1>
      <p className="text-gray-600">Página no encontrada.</p>
      <Link href="/" className="text-primary underline hover:text-primary-dark">
        Volver al inicio
      </Link>
    </div>
  );
}
