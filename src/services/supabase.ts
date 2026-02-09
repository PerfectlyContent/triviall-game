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

// --- Realtime ---
export function subscribeToGame(
  roomCode: string,
  gameId: string,
  callbacks: {
    onGameUpdate: (payload: Record<string, unknown>) => void;
    onPlayerJoin: (payload: Record<string, unknown>) => void;
    onPlayerUpdate: (payload: Record<string, unknown>) => void;
    onBroadcast: (event: string, payload: Record<string, unknown>) => void;
  },
): RealtimeChannel | null {
  if (!supabase) return null;

  const channel = supabase.channel(`game:${roomCode}`);

  channel
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'games', filter: `room_code=eq.${roomCode}` },
      (payload) => {
        console.log('[Realtime] Game update:', payload.new);
        callbacks.onGameUpdate(payload.new as Record<string, unknown>);
      },
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` },
      (payload) => {
        console.log('[Realtime] Player joined:', payload.new);
        callbacks.onPlayerJoin(payload.new as Record<string, unknown>);
      },
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` },
      (payload) => {
        console.log('[Realtime] Player update:', payload.new);
        callbacks.onPlayerUpdate(payload.new as Record<string, unknown>);
      },
    )
    .on('broadcast', { event: 'game_event' }, (payload) => {
      callbacks.onBroadcast(
        (payload.payload as Record<string, unknown>).type as string,
        payload.payload as Record<string, unknown>,
      );
    })
    .on('broadcast', { event: 'player_joined' }, (payload) => {
      console.log('[Realtime] Broadcast player joined:', payload.payload);
      callbacks.onPlayerJoin(payload.payload as Record<string, unknown>);
    })
    .subscribe((status) => {
      console.log('[Realtime] Subscription status:', status);
    });

  return channel;
}

export function broadcastGameEvent(
  channel: RealtimeChannel,
  type: string,
  payload: Record<string, unknown>,
) {
  channel.send({
    type: 'broadcast',
    event: 'game_event',
    payload: { type, ...payload },
  });
}

// Broadcast when a player joins (for immediate sync)
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
