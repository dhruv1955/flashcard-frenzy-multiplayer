import { MatchReview } from "@/components/GameHistory";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Match Review</h1>
        <MatchReview gameId={id} />
      </div>
    </div>
  );
}


