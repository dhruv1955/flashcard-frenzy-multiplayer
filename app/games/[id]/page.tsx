import { GameRoom } from "@/components/GameRoom";

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <GameRoom gameId={id} />
      </div>
    </div>
  );
}


