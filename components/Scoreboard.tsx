"use client";

type Props = {
  scores: Record<string, number>;
  players: string[];
};

export function Scoreboard({ scores, players }: Props) {
  const rows = players.map((p) => ({ id: p, score: scores[p] ?? 0 })).sort((a, b) => b.score - a.score);
  return (
    <div className="rounded border border-white/10">
      <div className="px-3 py-2 border-b border-white/10 font-semibold">Scoreboard</div>
      <ul>
        {rows.map((r, i) => (
          <li key={r.id} className="flex items-center justify-between px-3 py-2">
            <span className="text-sm">#{i + 1} {r.id.slice(0, 6)}</span>
            <span className="text-sm font-mono">{r.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


