import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// --- Game CRUD ---
export async function createGame(game: {
  room_code: string;
  host_id: string;
  settings: object;
}) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('games')
    .insert(game)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getGameByRoomCode(roomCode: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('room_code', roomCode.toUpperCase())
    .neq('status', 'finished')
    .single();
  if (error) throw error;
  return data;
}

export async function updateGame(gameId: string, updates: Record<string, unknown>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', gameId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Player CRUD ---
export async function addPlayer(player: {
  game_id: string;
  name: string;
  age: string;
  avatar_emoji: string;
  difficulty: number;
  is_host?: boolean;
}) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('players')
    .insert(player)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePlayer(playerId: string, updates: Record<string, unknown>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', playerId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPlayersForGame(gameId: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .order('joined_at', { ascending: true });
  if (error) throw error;
  return data;
}

// --- Realtime (Broadcast-only for gameplay, postgres_changes INSERT for lobby) ---
export function subscribeToGame(
  roomCode: string,
  gameId: string,
  callbacks: {
    onBroadcast: (event: string, payload: Record<string, unknown>) => void;
    onPlayerInsert: (payload: Record<string, unknown>) => void;
  },
): RealtimeChannel | null {
  if (!supabase) return null;

  const channel = supabase.channel(`game:${roomCode}`, {
    config: { broadcast: { self: false, ack: true } },
  });

  channel
    // Lobby only: detect new players via DB insert (backup for broadcast)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` },
      (payload) => {
        console.log('[Realtime] Player INSERT (DB):', payload.new);
        callbacks.onPlayerInsert(payload.new as Record<string, unknown>);
      },
    )
    // ALL game events flow through broadcast (fast, no DB round-trip)
    .on('broadcast', { event: 'game_event' }, (payload) => {
      const p = payload.payload as Record<string, unknown>;
      console.log('[Realtime] Broadcast:', p.type, p);
      callbacks.onBroadcast(p.type as string, p);
    })
    // Player joined broadcast (lobby)
    .on('broadcast', { event: 'player_joined' }, (payload) => {
      console.log('[Realtime] Broadcast player_joined:', payload.payload);
      callbacks.onPlayerInsert(payload.payload as Record<string, unknown>);
    })
    .subscribe((status) => {
      console.log('[Realtime] Channel status:', status);
    });

  return channel;
}

export function broadcastGameEvent(
  channel: RealtimeChannel,
  type: string,
  payload: Record<string, unknown>,
) {
  console.log('[Broadcast SEND]', type, payload);
  channel.send({
    type: 'broadcast',
    event: 'game_event',
    payload: { type, ...payload },
  }).then((status) => {
    console.log('[Broadcast ACK]', type, status);
  }).catch((err) => {
    console.error('[Broadcast ERROR]', type, err);
  });
}

export function broadcastPlayerJoined(
  channel: RealtimeChannel,
  player: Record<string, unknown>,
) {
  channel.send({
    type: 'broadcast',
    event: 'player_joined',
    payload: player,
  });
}
