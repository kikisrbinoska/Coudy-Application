import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Pause, Square, Plus, Trash2, Music, Image, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import focusApi, { FocusTaskDto, FocusSettingsDto, FocusStatsDto } from "@/api/focusApi";

const BACKGROUNDS = [
  "linear-gradient(135deg, hsl(330 40% 98%), hsl(210 55% 97%))",
  "linear-gradient(135deg, hsl(210 70% 90%), hsl(330 60% 92%))",
  "linear-gradient(135deg, hsl(45 80% 92%), hsl(330 70% 90%))",
  "linear-gradient(135deg, hsl(280 60% 90%), hsl(210 70% 92%))",
];

const DARK_BACKGROUNDS = [
  "linear-gradient(135deg, hsl(330 20% 12%), hsl(210 25% 14%))",
  "linear-gradient(135deg, hsl(210 30% 15%), hsl(330 25% 13%))",
  "linear-gradient(135deg, hsl(45 25% 14%), hsl(330 22% 12%))",
  "linear-gradient(135deg, hsl(280 25% 14%), hsl(210 28% 15%))",
];

const THEME_NAMES = ["THEME_0", "THEME_1", "THEME_2", "THEME_3"] as const;

const themeIndex = (name: string): number => {
  const i = THEME_NAMES.indexOf(name as (typeof THEME_NAMES)[number]);
  return i >= 0 ? i : 0;
};

const Focus = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [tasks, setTasks] = useState<FocusTaskDto[]>([]);
  const [newTask, setNewTask] = useState("");
  const [taskLoading, setTaskLoading] = useState<Record<number, boolean>>({});

  const [totalPoints, setTotalPoints] = useState(0);
  const [stats, setStats] = useState<FocusStatsDto>({ totalSessions: 0, totalMinutes: 0, totalPointsEarned: 0 });
  const [settings, setSettings] = useState<FocusSettingsDto>({ musicEnabled: false, backgroundTheme: "THEME_0" });

  const [initialLoading, setInitialLoading] = useState(true);
  const [sessionSaving, setSessionSaving] = useState(false);

  const { toast } = useToast();

  const bgIndex = themeIndex(settings.backgroundTheme);
  const isDark = document.documentElement.classList.contains("dark");
  const background = isDark ? DARK_BACKGROUNDS[bgIndex] : BACKGROUNDS[bgIndex];

  const loadAll = useCallback(async () => {
    try {
      const [fetchedTasks, fetchedSettings, fetchedPoints, fetchedStats] =
        await Promise.all([
          focusApi.getTasks(),
          focusApi.getSettings(),
          focusApi.getPoints(),
          focusApi.getStats(),
        ]);
      setTasks(fetchedTasks);
      setSettings(fetchedSettings);
      setTotalPoints(fetchedPoints);
      setStats(fetchedStats);
    } catch {
      toast({ title: "Error", description: "Failed to load Focus data.", variant: "destructive" });
    } finally {
      setInitialLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  const handleStop = async () => {
    setIsRunning(false);
    if (time === 0) return;

    const elapsed = time;
    setTime(0);
    setSessionSaving(true);
    try {
      const result = await focusApi.createSession(elapsed);
      setTotalPoints(result.newTotalPoints);
      setStats((prev) => ({
        totalSessions: prev.totalSessions + 1,
        totalMinutes: prev.totalMinutes + Math.floor(elapsed / 60),
        totalPointsEarned: prev.totalPointsEarned + result.pointsEarned,
      }));
      toast({
        title: "Session Complete!",
        description: `You earned ${result.pointsEarned} points! Total: ${result.newTotalPoints} SP`,
      });
    } catch {
      toast({ title: "Error", description: "Failed to save session.", variant: "destructive" });
    } finally {
      setSessionSaving(false);
    }
  };

  const addTask = async () => {
    const title = newTask.trim();
    if (!title) return;
    setNewTask("");
    try {
      const created = await focusApi.createTask(title);
      setTasks((prev) => [created, ...prev]);
    } catch {
      toast({ title: "Error", description: "Failed to add task.", variant: "destructive" });
    }
  };

  const toggleTask = async (task: FocusTaskDto) => {
    setTaskLoading((prev) => ({ ...prev, [task.id]: true }));
    try {
      const updated = await focusApi.updateTask(task.id, !task.completed);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      toast({ title: "Error", description: "Failed to update task.", variant: "destructive" });
    } finally {
      setTaskLoading((prev) => ({ ...prev, [task.id]: false }));
    }
  };

  const deleteTask = async (id: number) => {
    setTaskLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await focusApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" });
    } finally {
      setTaskLoading((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const toggleMusic = async () => {
    const next: FocusSettingsDto = { ...settings, musicEnabled: !settings.musicEnabled };
    try {
      const saved = await focusApi.updateSettings(next);
      setSettings(saved);
      toast({
        title: saved.musicEnabled ? "Music Enabled" : "Music Disabled",
        description: saved.musicEnabled ? "Enjoy your cozy study music" : "Focus music turned off",
      });
    } catch {
      toast({ title: "Error", description: "Failed to save music setting.", variant: "destructive" });
    }
  };

  const changeTheme = async (index: number) => {
    const next: FocusSettingsDto = { ...settings, backgroundTheme: THEME_NAMES[index] };
    try {
      const saved = await focusApi.updateSettings(next);
      setSettings(saved);
    } catch {
      toast({ title: "Error", description: "Failed to save theme.", variant: "destructive" });
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8 transition-all duration-500"
      style={{ background }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Timer Display */}
        <Card className="glass-card p-12 border-0 text-center">
          <div
            className="text-8xl md:text-9xl font-bold mb-8 tracking-tight"
            style={{
              background: isDark
                ? "linear-gradient(135deg, hsl(330,65%,72%), hsl(264,40%,60%))"
                : "linear-gradient(135deg, hsl(330,80%,42%), hsl(210,80%,42%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {formatTime(time)}
          </div>

          <div className="flex justify-center gap-4 mb-6">
            {!isRunning ? (
              <Button
                onClick={handleStart}
                size="lg"
                className="gradient-primary border-0 text-white text-lg px-8"
                disabled={sessionSaving}
              >
                <Play className="w-6 h-6 mr-2" />
                Start Focus
              </Button>
            ) : (
              <Button onClick={handlePause} size="lg" variant="secondary" className="text-lg px-8">
                <Pause className="w-6 h-6 mr-2" />
                Pause
              </Button>
            )}
            <Button
              onClick={handleStop}
              size="lg"
              variant="outline"
              className="text-lg px-8"
              disabled={sessionSaving}
            >
              {sessionSaving ? (
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              ) : (
                <Square className="w-6 h-6 mr-2" />
              )}
              Stop
            </Button>
          </div>

          <div className="glass p-6 rounded-2xl inline-block">
            <p className="text-sm text-muted-foreground mb-2">Your Points</p>
            <p
              className="text-4xl font-bold"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, hsl(38,80%,68%), hsl(330,60%,68%))"
                  : "linear-gradient(135deg, hsl(35,90%,38%), hsl(330,80%,42%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {totalPoints} SP
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks */}
          <Card className="glass-card p-6 border-0">
            <h3 className="text-2xl font-bold mb-4">Focus Tasks</h3>

            <div className="flex gap-2 mb-4">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Add a task..."
                className="flex-1"
              />
              <Button onClick={addTask} className="gradient-primary border-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 glass rounded-xl">
                  <Checkbox
                    checked={task.completed}
                    disabled={taskLoading[task.id]}
                    onCheckedChange={() => toggleTask(task)}
                  />
                  <span
                    className={`flex-1 ${task.completed ? "line-through text-muted-foreground" : ""}`}
                  >
                    {task.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={taskLoading[task.id]}
                    onClick={() => deleteTask(task.id)}
                  >
                    {taskLoading[task.id] ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No tasks yet. Add one to get started!
                </p>
              )}
            </div>
          </Card>

          {/* Settings */}
          <Card className="glass-card p-6 border-0">
            <h3 className="text-2xl font-bold mb-4">Focus Settings</h3>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-primary" />
                    <span className="font-medium">Cozy Music</span>
                  </div>
                  <Button
                    variant={settings.musicEnabled ? "default" : "outline"}
                    onClick={toggleMusic}
                  >
                    {settings.musicEnabled ? "On" : "Off"}
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Image className="w-5 h-5 text-primary" />
                  <span className="font-medium">Background Theme</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {BACKGROUNDS.map((bg, index) => (
                    <button
                      key={index}
                      onClick={() => changeTheme(index)}
                      className={`h-20 rounded-xl border-2 transition-all ${
                        bgIndex === index
                          ? "border-primary scale-105 shadow-lg"
                          : "border-border hover:scale-102"
                      }`}
                      style={{ background: bg }}
                    />
                  ))}
                </div>
              </div>

              <div className="glass p-4 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Session Stats</p>
                <div className="space-y-1">
                  <p className="text-lg font-bold">
                    {stats.totalSessions} session{stats.totalSessions !== 1 ? "s" : ""} completed
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stats.totalMinutes} min studied &middot; {stats.totalPointsEarned} SP earned
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">10 points per minute studied</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Focus;
