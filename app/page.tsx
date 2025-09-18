import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/Skeleton";

const GameHistoryList = dynamic(() => import("@/components/GameHistory").then(m => m.GameHistoryList), { ssr: false, loading: () => <Skeleton className="h-24" /> });

export default function Home() {
  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Flashcard Frenzy</h1>
          <p className="text-sm text-gray-500">Compete in real-time quiz battles.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Sign in</Link>
          <Link href="/games/new" className="px-4 py-2 bg-purple-600 text-white rounded">Create Game</Link>
        </div>
        <Suspense fallback={<Skeleton className="h-24" />}>
          <GameHistoryList />
        </Suspense>
      </div>
    </div>
  );
}
