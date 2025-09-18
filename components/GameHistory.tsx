"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";

type HistoryItem = {
  gameId: string;
  finalScore: number;
  duration: number;
  accuracy: number;
  createdAt: string;
};

export function GameHistoryList() {
  const { user } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/history/${user.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load history');
        setItems(data.history);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) return <div className="text-sm text-gray-500">Sign in to view history.</div>;
  if (loading) return <div className="animate-pulse h-24 bg-white/5 rounded" />;
  if (error) return <div className="text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <a key={it.gameId} href={`/review/${it.gameId}`} className="block border border-white/10 rounded p-3 hover:bg-white/5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-mono">{it.gameId.slice(0, 8)}</div>
            <div className="text-xs text-gray-400">{new Date(it.createdAt).toLocaleString()}</div>
          </div>
          <div className="text-sm">Score: {it.finalScore} · Accuracy: {(it.accuracy * 100).toFixed(0)}% · Duration: {(it.duration / 1000).toFixed(0)}s</div>
        </a>
      ))}
    </div>
  );
}

export function MatchReview({ gameId }: { gameId: string }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/history/game/${gameId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load match');
        setData(json);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gameId]);

  if (loading) return <div className="animate-pulse h-24 bg-white/5 rounded" />;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!data) return null;

  const players: string[] = data.game.players;
  const scoreboard: Record<string, number> = data.game.scores;
  return (
    <div className="space-y-4">
      <div className="border border-white/10 rounded p-3">
        <div className="text-sm font-semibold mb-2">Final Scores</div>
        <ul className="text-sm">
          {players.map((p: string) => (
            <li key={p} className="flex items-center justify-between">
              <span>{p.slice(0, 6)}</span>
              <span className="font-mono">{scoreboard[p] ?? 0}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="border border-white/10 rounded p-3">
        <div className="text-sm font-semibold mb-2">Question Breakdown</div>
        <ul className="space-y-2">
          {data.breakdown.map((b: any, i: number) => (
            <li key={i} className="text-sm">
              <div className="font-medium">Q{i + 1}: {b.prompt}</div>
              <div className={b.correct ? 'text-green-600' : 'text-red-600'}>
                {b.playerId.slice(0,6)} answered "{b.answer}" · {b.correct ? 'Correct' : 'Wrong'} · {b.timeMs ? `${Math.round(b.timeMs / 100) / 10}s` : '—'}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


