import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@moni/api/client';
import { cookies } from 'next/headers';

export default async function RootPage() {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
