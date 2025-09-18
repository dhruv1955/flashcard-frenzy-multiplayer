"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import { QuestionCard } from "./QuestionCard";
import { Scoreboard } from "./Scoreboard";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { subscribeToActiveGame } from "@/lib/realtime";

type GameState = {
  id: string;
  status: 'waiting' | 'in_progress' | 'completed';
  players: string[];
  scores: Record<string, number>;
  current_question_id: string | null;
};

export function GameRoom({ gameId }: { gameId: string }) {
  const { user } = useAuth();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [state, setState] = useState<GameState | null>(null);
  const [questionPrompt, setQuestionPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToActiveGame(supabase, gameId, (row: any) => {
      setState({
        id: row.id,
        status: row.status,
        players: row.players,
        scores: row.scores,
        current_question_id: row.current_question_id,
      });
    });
    return () => unsubscribe();
  }, [gameId, supabase]);

  useEffect(() => {
    const loadPrompt = async () => {
      if (!state?.current_question_id) {
        setQuestionPrompt(null);
        return;
      }
      // Fetch question from MongoDB API by ID; fall back to random if not available here
      try {
        const res = await fetch(`/api/games/${gameId}`);
        const data = await res.json();
        if (res.ok && data.game?.currentQuestion) {
          // For demo: we only have random endpoint; you might implement GET /api/questions/[id]
          const r = await fetch('/api/questions/random');
          const d = await r.json();
          if (r.ok) setQuestionPrompt(d.question.question);
        }
      } catch {}
    };
    loadPrompt();
  }, [state?.current_question_id, gameId]);

  const submitAnswer = async (answer: string) => {
    if (!user) return;
    setError(null);
    const res = await fetch(`/api/games/${gameId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: user.id, answer }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed to submit');
  };

  const next = async () => {
    const res = await fetch(`/api/games/${gameId}/next`, { method: 'POST' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to advance');
    }
  };

  if (!state) return <div className="p-4">Connecting...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="rounded border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Game #{state.id.slice(0, 6)}</h2>
            <span className="text-xs uppercase tracking-wide">{state.status}</span>
          </div>
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          {state.status === 'waiting' && <p>Waiting for players...</p>}
          {state.status === 'in_progress' && questionPrompt && (
            <QuestionCard prompt={questionPrompt} seconds={30} onAnswer={submitAnswer} />
          )}
          {state.status === 'completed' && (
            <div className="space-y-2">
              <p className="font-medium">Game over!</p>
              <button onClick={next} className="px-3 py-2 bg-blue-600 text-white rounded">Play again</button>
            </div>
          )}
        </div>
        <div>
          <button onClick={next} className="px-3 py-2 bg-gray-700 text-white rounded">Next Question</button>
        </div>
      </div>
      <div>
        <Scoreboard scores={state.scores} players={state.players} />
      </div>
    </div>
  );
}


