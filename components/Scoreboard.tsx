"use client";

import { memo, useMemo } from "react";

type Props = {
  scores: Record<string, number>;
  players: string[];
};

function ScoreboardBase({ scores, players }: Props) {
  const rows = useMemo(() => players.map((p) => ({ id: p, score: scores[p] ?? 0 })).sort((a, b) => b.score - a.score), [players, scores]);
  return (
    <div className="rounded border border-white/10">
      <div className="px-3 py-2 border-b border-white/10 font-semibold">Scoreboard</div>
      <ul>
        {rows.map((r, i) => (
          <li key={r.id} className="flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors">
            <span className="text-sm">#{i + 1} {r.id.slice(0, 6)}</span>
            <span className="text-sm font-mono">{r.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Scoreboard = memo(ScoreboardBase);


