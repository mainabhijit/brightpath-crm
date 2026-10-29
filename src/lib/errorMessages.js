/**
 * Translate low-level errors (network, Postgres, auth) into messages a
 * counsellor can act on. Unknown errors keep their original message.
 */

const NETWORK_PATTERNS = [/failed to fetch/i, /networkerror/i, /load failed/i, /network request failed/i];

export const NETWORK_ERROR_MESSAGE =
  "Can't reach the server. Check your internet connection and try again.";

export function friendlyError(err, fallback = 'Something went wrong. Please try again.') {
  const message = typeof err === 'string' ? err : err?.message;
  const code = typeof err === 'object' ? err?.code : undefined;

  if (!message) return fallback;
  if (NETWORK_PATTERNS.some((re) => re.test(message))) return NETWORK_ERROR_MESSAGE;
  // Postgres: RLS denial / insufficient privilege
  if (code === '42501' || /row-level security/i.test(message)) {
    return "You don't have permission to make this change.";
  }
  // Postgres: check constraint violation
  if (code === '23514' || /violates check constraint/i.test(message)) {
    return 'Some details are invalid. Please review the form and try again.';
  }
  // PostgREST: .single() matched no rows (deleted or not visible under RLS)
  if (code === 'PGRST116') {
    return 'This record no longer exists or you no longer have access to it.';
  }
  return message;
}
