import type { SupabaseClient } from '@supabase/supabase-js';
import type { ActiveGameRow, GameEventRow } from '@/types/db';

export function subscribeToActiveGame(
  supabase: SupabaseClient,
  gameId: string,
  onUpdate: (row: ActiveGameRow) => void
) {
  const channel = supabase
    .channel(`active_game:${gameId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'active_games', filter: `id=eq.${gameId}` },
      (payload) => {
        const row = (payload.new ?? payload.old) as ActiveGameRow;
        if (row) onUpdate(row);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function publishGameState(
  supabase: SupabaseClient,
  row: ActiveGameRow
) {
  // Typically performed by database triggers or serverless functions.
  // Here we assume you have RLS policies and upsert rights.
  const { error } = await supabase.from('active_games').upsert(row);
  if (error) throw error;
}

export async function insertGameEvent(
  supabase: SupabaseClient,
  event: GameEventRow
) {
  const { error } = await supabase.from('game_events').insert(event);
  if (error) throw error;
}


