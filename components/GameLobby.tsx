"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

export function GameLobby({ gameId }: { gameId: string }) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [game, setGame] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/games/${gameId}`);
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Failed to load game');
      else setGame(data.game);
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

  const start = async () => {
    setError(null);
    const res = await fetch(`/api/games/${gameId}/start`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed to start');
    else setGame(data.game);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Lobby</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="text-sm">Game ID: {gameId}</div>
      <div className="text-sm">Players: {game?.players?.length ?? 0}</div>
      <div className="flex gap-2">
        <button onClick={join} disabled={!user || joining} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-60">Join</button>
        <button onClick={start} className="px-3 py-2 bg-green-600 text-white rounded">Start</button>
        <Link href={`/games/${gameId}`} className="px-3 py-2 bg-gray-700 text-white rounded">Open Room</Link>
      </div>
    </div>
  );
}


