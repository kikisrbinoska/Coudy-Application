import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Clock } from "lucide-react";

interface StudySession {
  date: string;
  duration: number;
}

const StudyTimer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<StudySession[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleStop = () => {
    if (time > 0) {
      setSessions([...sessions, { date: new Date().toISOString(), duration: time }]);
    }
    setIsRunning(false);
    setTime(0);
  };

  const totalStudyTime = sessions.reduce((acc, session) => acc + session.duration, 0);

  return (
    <Card className="glass-card p-6 border-0">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Study Timer</h3>
      </div>
      
      <div className="text-center mb-6">
        <div className="text-5xl font-bold gradient-primary bg-clip-text text-transparent mb-4">
          {formatTime(time)}
        </div>
        <div className="flex justify-center gap-2">
          {!isRunning ? (
            <Button onClick={handleStart} className="gradient-primary border-0">
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button onClick={handlePause} variant="secondary">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          <Button onClick={handleStop} variant="outline">
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        </div>
      </div>

      <div className="glass p-4 rounded-2xl">
        <p className="text-sm text-muted-foreground mb-2">Total Study Time Today</p>
        <p className="text-2xl font-bold">{formatTime(totalStudyTime)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} completed
        </p>
      </div>
    </Card>
  );
};

export default StudyTimer;
