// Supabase direct browser access is disabled.
// All database operations go through the Laravel API.
export function createClient() {
  throw new Error('Direct Supabase browser access is not supported. Use Laravel API routes instead.')
}
