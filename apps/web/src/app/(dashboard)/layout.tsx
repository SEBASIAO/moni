import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { createSupabaseServerClient } from '@moni/api/client';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
