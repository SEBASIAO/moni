import { corsHeaders, handleCors } from '../_shared/cors.ts';

/**
 * Example Supabase Edge Function.
 * Deploy: supabase functions deploy hello-world
 * Test locally: supabase functions serve hello-world
 */
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { name } = await req.json() as { name?: string };
    const greeting = `Hello, ${name ?? 'World'}!`;

    return new Response(JSON.stringify({ message: greeting }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
