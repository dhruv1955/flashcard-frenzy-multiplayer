"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";

export function GameLobby({ gameId }: { gameId: string }) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);
  const [game, setGame] = useState<any>(null);
  const [active, setActive] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [gRes, aRes] = await Promise.all([
          fetch(`/api/games/${gameId}`),
          fetch('/api/games/active'),
        ]);
        const g = await gRes.json();
        const a = await aRes.json();
        if (gRes.ok) setGame(g.game); else setError(g.error || 'Failed to load game');
        if (aRes.ok) setActive(a.games); else setError(a.error || 'Failed to load active games');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gameId]);

  const join = async () => {
    if (!user) return;
    setJoining(true);
    setError(null);
    try {
      const res = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: user.id, gameId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join');
      setGame(data.game);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setJoining(false);
    }
  };

  const createGame = async () => {
    if (!user) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      setGame(data.game);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const start = async () => {
    setError(null);
    const res = await fetch(`/api/games/${gameId}/start`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed to start');
    else setGame(data.game);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Lobby</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="text-sm">Game ID: {gameId}</div>
      <div className="text-sm">Players: {game?.players?.length ?? 0}</div>
      <div className="flex gap-2">
        <button onClick={join} disabled={!user || joining} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-60 hover:opacity-90">Join</button>
        <button onClick={start} className="px-3 py-2 bg-green-600 text-white rounded hover:opacity-90">Start</button>
        <button onClick={createGame} disabled={!user || creating} className="px-3 py-2 bg-purple-600 text-white rounded disabled:opacity-60 hover:opacity-90">Create Game</button>
        <Link href={`/games/${gameId}`} className="px-3 py-2 bg-gray-700 text-white rounded hover:opacity-90">Open Room</Link>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Active Games</h3>
        {loading ? (
          <div className="animate-pulse h-20 bg-white/5 rounded" />
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {active.map((g) => (
              <li key={g.id} className="border border-white/10 rounded p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-mono">{g.id.slice(0, 8)}</div>
                  <div className="text-xs text-gray-400">Players: {g.players.length}</div>
                </div>
                <Link href={`/games/${g.id}`} className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:opacity-90">Join</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


