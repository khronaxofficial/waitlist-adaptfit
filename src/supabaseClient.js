import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  typeof url === 'string' &&
  url.startsWith('http') &&
  typeof anonKey === 'string' &&
  anonKey.length > 10;

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;

/**
 * Insert an email (and optional gear type) into the waitlist table.
 * Returns { ok: true } on success, or { ok: false, reason } on failure.
 * reason is one of: 'not_configured' | 'duplicate' | 'error'
 */
export async function joinWaitlist(email, gear) {
  if (!supabase) {
    return { ok: false, reason: 'not_configured' };
  }

  const { data, error } = await supabase
    .from('waitlist')
    .insert([{ email, gear: gear || null }]);

  if (error) {
    const duplicate =
      error.code === '23505' ||
      /duplicate/i.test(error.message || '') ||
      /unique constraint/i.test(error.details || '');

    if (duplicate) {
      return { ok: false, reason: 'duplicate' };
    }

    console.error('Supabase insert error:', error);
    const networkFailure = /fetch failed|ENOTFOUND|network/i.test(
      error.message || error.details || ''
    );

    return {
      ok: false,
      reason: networkFailure ? 'network' : 'error',
      errorMessage: error.message || error.details || 'Unknown Supabase error'
    };
  }

  return { ok: true, data };
}
