import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import gameApi, { GameDto } from "@/api/gameApi";

const GamePlay = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;
    gameApi
      .getById(Number(gameId))
      .then(setGame)
      .catch(() => setError("Game not found."))
      .finally(() => setLoading(false));
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">{error ?? "Game not found."}</p>
        <Button variant="outline" onClick={() => navigate("/games")}>Back to Games</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Button variant="outline" className="mb-4" onClick={() => navigate("/games")}>
        ← Back
      </Button>
      <Card className="p-6">
        <div className="text-5xl mb-4">{game.icon}</div>
        <h1 className="text-2xl font-bold mb-1">{game.name}</h1>
        <p className="text-muted-foreground mb-4">{game.description}</p>
        <div className="flex gap-4 text-sm text-muted-foreground mb-6">
          <span>Subject: <strong>{game.subject}</strong></span>
          <span>Difficulty: <strong>{game.difficulty}</strong></span>
          <span>Points: <strong>{game.points}</strong></span>
        </div>
        <p className="text-center text-muted-foreground">Game content coming soon.</p>
      </Card>
    </div>
  );
};

export default GamePlay;