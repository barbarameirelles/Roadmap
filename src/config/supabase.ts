// Config pública do Supabase (URL + anon key são públicas por design — vão no bundle).
// O acesso é só leitura (RLS) + invocar a Edge Function de sync.
export const SUPABASE_URL = "https://mluvrpmjsgmaluuzilgg.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_VUOoETnmh66vYgwUEpfqiQ_ME86etrT";

export const SYNC_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/sync-jira`;
export const REST_URL = `${SUPABASE_URL}/rest/v1`;

export const supabaseHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};
