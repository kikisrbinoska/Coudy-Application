import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Clock, Zap } from "lucide-react";
import focusApi from "@/api/focusApi";

interface Props {
  onPointsUpdated?: (newTotal: number) => void;
}

const StudyTimer = ({ onPointsUpdated }: Props) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastEarned, setLastEarned] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleStop = async () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (time === 0) return;
    const elapsed = time;
    setTime(0);
    setSaving(true);
    try {
      const result = await focusApi.createSession(elapsed);
      setLastEarned(result.points_earned);
      onPointsUpdated?.(result.new_total_points);
      setTimeout(() => setLastEarned(null), 4000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const estimatedSP = Math.floor(time / 60) * 10;

  return (
    <Card className="glass-card p-6 border-0">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Study Timer</h3>
      </div>

      <div className="text-center mb-6">
        <div className="text-5xl font-mono font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          {formatTime(time)}
        </div>
        {time > 0 && (
          <p className="text-sm text-muted-foreground mb-3">
            <Zap className="w-4 h-4 inline-block text-primary mr-1" />
            +{estimatedSP} SP this session
          </p>
        )}
        <div className="flex justify-center gap-2">
          {!isRunning ? (
            <Button onClick={() => setIsRunning(true)} className="gradient-primary border-0" disabled={saving}>
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button onClick={() => setIsRunning(false)} variant="secondary">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          <Button onClick={handleStop} variant="outline" disabled={time === 0 || saving}>
            <Square className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Stop & Save"}
          </Button>
        </div>
      </div>

      {lastEarned !== null && (
        <div className="glass p-4 rounded-2xl text-center">
          <p className="text-lg font-bold text-primary">+{lastEarned} SP earned!</p>
          <p className="text-xs text-muted-foreground">Session saved to your profile</p>
        </div>
      )}
    </Card>
  );
};

export default StudyTimer;
