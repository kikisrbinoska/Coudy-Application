import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import gameSessionApi, { QuestionDto, SubmitAnswerResponseDto } from "@/games/api/gameSessionApi";

const GamePlay = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [question, setQuestion] = useState<QuestionDto | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    startGame();
  }, []);

  const startGame = async () => {
    try {
      setLoading(true);
      const session = await gameSessionApi.start(Number(gameId));
      setSessionId(session.id);
      await loadQuestion(session.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestion = async (id: number) => {
    try {
      setFeedback(null);
      const q = await gameSessionApi.getQuestion(id);
      setQuestion(q);
    } catch (err) {
      console.error(err);
    }
  };

  const submitAnswer = async (answer: string) => {
    if (!sessionId) return;
    try {
      const response: SubmitAnswerResponseDto =
        await gameSessionApi.answer(sessionId, answer);
      setScore(response.score);
      setFeedback(response.correct ? "✅ Correct!" : "❌ Wrong!");
      if (response.finished) {
        setFinished(true);
        setQuestion(null);
        return;
      }
      await loadQuestion(sessionId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center space-y-4">
          <h1 className="text-3xl font-bold">🎉 Game Finished!</h1>
          <p className="text-xl">Final Score: <strong>{score}</strong></p>
          <Button onClick={() => navigate("/games")}>Back to Games</Button>
        </Card>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">No question found.</p>
        <Button variant="outline" onClick={() => navigate("/games")}>Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl p-8 space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Game Session</h1>
          <div className="font-bold text-primary">Score: {score}</div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{question.text}</h2>
          <div className="space-y-3">
            {question.options.map((option) => (
              <Button
                key={option}
                className="w-full"
                variant="outline"
                onClick={() => submitAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        {feedback && (
          <div className="text-center font-semibold text-lg">{feedback}</div>
        )}

      </Card>
    </div>
  );
};

export default GamePlay;