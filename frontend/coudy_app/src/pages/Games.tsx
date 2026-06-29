import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import gameApi, { GameDto } from "@/api/gameApi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2 } from "lucide-react";



const Games = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<GameDto[]>([]);

  useEffect(() => {
    gameApi.getAll()
      .then(setGames)
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
        <Gamepad2 /> Games
      </h1>

      {games.length === 0 ? (
        <p className="text-muted-foreground">No games available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {games.map((game) => (
            <Card key={game.id} className="p-4">
              <div className="text-4xl mb-2">{game.icon}</div>

              <h2 className="font-bold">{game.name}</h2>
              <p className="text-sm text-muted-foreground">
                {game.description}
              </p>

              <div className="flex justify-between mt-3">
                <Badge>{game.difficulty}</Badge>
                <span className="text-primary font-bold">
                  +{game.points} SP
                </span>
              </div>

              <Button
                className="w-full mt-4"
                onClick={() => {
  console.log("game.id:", game.id);
  navigate(`/games/${game.id}`);
}}
              >
                Play
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Games;