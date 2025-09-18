"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  prompt: string;
  onAnswer: (value: string) => Promise<void> | void;
  seconds: number;
};

export function QuestionCard({ prompt, onAnswer, seconds }: Props) {
  const [value, setValue] = useState("");
  const [remaining, setRemaining] = useState(seconds);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setRemaining(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [seconds]);

  const progress = useMemo(() => (remaining / seconds) * 100, [remaining, seconds]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAnswer(value);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-2 bg-gray-200 rounded">
        <div className="h-2 bg-blue-600 rounded" style={{ width: `${progress}%`, transition: 'width 1s linear' }} />
      </div>
      <p className="text-lg font-medium">{prompt}</p>
      <form onSubmit={submit} className="flex gap-2">
        <input value={value} onChange={(e) => setValue(e.target.value)} className="border px-3 py-2 rounded flex-1" placeholder="Your answer" />
        <button type="submit" disabled={submitting || remaining === 0} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">Submit</button>
      </form>
      <div className="text-sm text-gray-500">Time left: {remaining}s</div>
    </div>
  );
}


