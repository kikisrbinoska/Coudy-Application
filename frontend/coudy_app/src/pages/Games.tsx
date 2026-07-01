import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import gameApi, { GameDto } from "@/api/gameApi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2 } from "lucide-react";
import gameSessionApi, { GameSessionResultDto } from "@/games/api/gameSessionApi";

const difficultyColor: Record<string, string> = {
  EASY: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HARD: "bg-orange-100 text-orange-700",
  EXPERT: "bg-red-100 text-red-700",
};

const Games = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<GameDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GameSessionResultDto[]>([]);

  useEffect(() => {
    gameApi
      .getAll()
      .then(setGames)
      .catch(() => setError("Failed to load games."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    gameSessionApi.getMyResults()
      .then(setResults)
      .catch(console.error);
  }, []);

  const getLastResult = (gameId: number) =>
    results
      .filter((r) => r.game_id === gameId)
      .sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime())[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading games...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
        <Gamepad2 /> Games
      </h1>
      <p className="text-muted-foreground mb-6">Pick a game and start playing</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">No games available yet.</p>
        ) : (
          games.map((game) => {
            const result = getLastResult(game.id);
            return (
              <Card key={game.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{game.icon}</div>
                <h2 className="text-lg font-semibold mb-1">{game.name}</h2>
                <p className="text-sm text-muted-foreground mb-3">{game.description}</p>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <Badge className={difficultyColor[game.difficulty] ?? ""}>
                    {game.difficulty}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{game.subject}</span>
                  <span className="ml-auto text-xs font-medium">{game.points} pts</span>
                </div>
                {result && (
                  <div className="text-xs text-muted-foreground mb-2 text-center">
                    Last score:{" "}
                    <span className="text-primary font-semibold">
                      {result.score}/{result.max_score}
                    </span>
                  </div>
                )}
                <Button
                  className="w-full"
                  onClick={() => navigate(`/games/${game.id}`)}
                >
                  Play
                </Button>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Games;