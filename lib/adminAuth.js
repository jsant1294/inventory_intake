import { createClient } from '@supabase/supabase-js';

function errorResponse(message, status) {
  return Response.json({ error: message }, { status });
}

export async function requireAdminUser(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      error: errorResponse(
        'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.',
        500,
      ),
    };
  }

  if (!token) {
    return { error: errorResponse('You must be logged in to continue.', 401) };
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await authClient.auth.getUser(token);

  if (error || !data.user) {
    return { error: errorResponse('Your session is invalid. Please log in again.', 401) };
  }

  if (data.user.user_metadata?.role !== 'admin') {
    return { error: errorResponse('Only admins can perform this action.', 403) };
  }

  return { user: data.user };
}
