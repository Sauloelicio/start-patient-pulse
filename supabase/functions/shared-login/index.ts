import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const respond = (status: number, body: unknown) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return respond(405, { error: 'Método não permitido' });
  const expected = Deno.env.get('APP_PASSWORD');
  const accountPassword = Deno.env.get('SERVICE_ACCOUNT_PASSWORD');
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_ANON_KEY');
  if (!expected || !accountPassword || !url || !key) {
    return respond(503, { error: 'Acesso indisponível. Tente novamente mais tarde.' });
  }
  let body: unknown;
  try { body = await req.json(); } catch { return respond(400, { error: 'Solicitação inválida' }); }
  if (typeof body !== 'object' || body === null || !('password' in body) ||
      typeof body.password !== 'string' || body.password.length > 1024) {
    return respond(400, { error: 'Solicitação inválida' });
  }
  // Compare fixed-size digests without exposing the shared secret to the browser.
  const digest = async (value: string) => new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)),
  );
  const [actual, wanted] = await Promise.all([digest(body.password), digest(expected)]);
  let difference = 0;
  for (let i = 0; i < wanted.length; i++) difference |= actual[i] ^ wanted[i];
  if (difference !== 0) return respond(401, { error: 'Senha incorreta' });
  try {
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.auth.signInWithPassword({
      email: 'sistema@startfisio.local', password: accountPassword,
    });
    if (error || !data.session) return respond(503, { error: 'Não foi possível acessar o sistema.' });
    return respond(200, { session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    } });
  } catch { return respond(503, { error: 'Não foi possível acessar o sistema.' }); }
});