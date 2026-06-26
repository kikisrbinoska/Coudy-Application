import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Play,
  Pause,
  Square,
  Plus,
  Trash2,
  Image,
  Loader2,
  Clock,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import focusApi, {
  FocusTaskDto,
  FocusSettingsDto,
  FocusStatsDto,
  FocusSessionResponseDto,
} from "@/api/focusApi";

interface MusicTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  previewUrl: string;
  artworkUrl60: string;
}

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
  const [sessionSaving, setSessionSaving] = useState(false);

  const [tasks, setTasks] = useState<FocusTaskDto[]>([]);
  const [newTask, setNewTask] = useState("");
  const [taskLoading, setTaskLoading] = useState<Record<number, boolean>>({});

  const [totalPoints, setTotalPoints] = useState(0);
  const [stats, setStats] = useState<FocusStatsDto>({
    total_sessions: 0,
    total_minutes: 0,
    total_points_earned: 0,
  });
  const [settings, setSettings] = useState<FocusSettingsDto>({
    musicEnabled: false,
    backgroundTheme: "THEME_0",
  });
  const [sessionLog, setSessionLog] = useState<FocusSessionResponseDto[]>([]);

  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [musicLoading, setMusicLoading] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const bgIndex = themeIndex(settings.backgroundTheme);
  const background = isDark ? DARK_BACKGROUNDS[bgIndex] : BACKGROUNDS[bgIndex];

  // Reactive dark mode detection
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

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

  const loadMusicTracks = useCallback(async () => {
    setMusicLoading(true);
    try {
      const res = await fetch(
        "https://itunes.apple.com/search?term=lofi+chill+study&mediaType=music&limit=20&country=us"
      );
      const data = await res.json();
      const tracks = (data.results as MusicTrack[])
        .filter((t) => t.previewUrl)
        .slice(0, 8);
      setMusicTracks(tracks);
    } catch {
      // Music is optional; ignore failures silently
    } finally {
      setMusicLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    loadMusicTracks();
  }, [loadAll, loadMusicTracks]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Play/pause when music enabled state changes
  useEffect(() => {
    if (!audioRef.current) return;
    if (settings.musicEnabled) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [settings.musicEnabled]);

  // Reload track when selection changes or tracks first load
  useEffect(() => {
    if (!audioRef.current || musicTracks.length === 0) return;
    audioRef.current.load();
    if (settings.musicEnabled) {
      audioRef.current.play().catch(() => {});
    }
  }, [selectedTrackIndex, musicTracks]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const estimatedPoints = Math.floor(time / 60) * 10;

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
      setTotalPoints(result.new_total_points);
      setSessionLog((prev) => [result, ...prev]);
      setStats((prev) => ({
        total_sessions: prev.total_sessions + 1,
        total_minutes: prev.total_minutes + Math.floor(elapsed / 60),
        total_points_earned: prev.total_points_earned + result.points_earned,
      }));
      toast({
        title: "Session Complete!",
        description: `You earned ${result.points_earned} points! Total: ${result.new_total_points} SP`,
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
    const next: FocusSettingsDto = {
      ...settings,
      musicEnabled: !settings.musicEnabled,
    };
    try {
      const saved = await focusApi.updateSettings(next);
      setSettings(saved);
    } catch {
      toast({
        title: "Error",
        description: "Failed to save music setting.",
        variant: "destructive",
      });
    }
  };

  const selectTrack = (index: number) => setSelectedTrackIndex(index);

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

  const currentTrack = musicTracks[selectedTrackIndex];

  return (
    <div
      className="min-h-screen p-4 md:p-8 transition-all duration-500"
      style={{ background }}
    >
      {/* Hidden audio player — rendered only once tracks are available */}
      {currentTrack && (
        <audio ref={audioRef} src={currentTrack.previewUrl} loop />
      )}

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

          {isRunning && (
            <p className="text-sm text-muted-foreground mb-4">
              {estimatedPoints > 0
                ? `Earning ${estimatedPoints} SP this session...`
                : "Session in progress..."}
            </p>
          )}

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

        {/* Session History */}
        {sessionLog.length > 0 && (
          <Card className="glass-card p-6 border-0">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">Today's Sessions</h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sessionLog.map((s, i) => {
                const mins = Math.floor(s.duration_seconds / 60);
                const secs = s.duration_seconds % 60;
                const when = new Date(s.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={s.id ?? i} className="flex items-center justify-between glass rounded-xl px-4 py-2 text-sm">
                    <span className="text-muted-foreground">{when}</span>
                    <span className="font-medium">
                      {mins > 0 ? `${mins}m ` : ""}{secs}s
                    </span>
                    <span className="text-primary font-bold">+{s.points_earned} SP</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

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
              {/* Cozy Music */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {settings.musicEnabled ? (
                      <Volume2 className="w-5 h-5 text-primary" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="font-medium">Cozy Music</span>
                    {settings.musicEnabled && currentTrack && (
                      <span className="text-xs text-muted-foreground">
                        ♪ Now playing
                      </span>
                    )}
                  </div>
                  <Button
                    variant={settings.musicEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={toggleMusic}
                    className={
                      settings.musicEnabled
                        ? "gradient-primary border-0 text-white"
                        : ""
                    }
                  >
                    {settings.musicEnabled ? "On" : "Off"}
                  </Button>
                </div>

                {musicLoading ? (
                  <div className="flex items-center gap-2 py-4 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Loading tracks...
                    </span>
                  </div>
                ) : musicTracks.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                    {musicTracks.map((track, index) => (
                      <button
                        key={track.trackId}
                        onClick={() => selectTrack(index)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all border-2 ${
                          selectedTrackIndex === index
                            ? "border-primary bg-primary/10"
                            : "border-border glass hover:border-primary/40"
                        }`}
                      >
                        <img
                          src={track.artworkUrl60}
                          alt={track.trackName}
                          className="w-10 h-10 rounded-lg flex-shrink-0 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate leading-tight">
                            {track.trackName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {track.artistName}
                          </p>
                        </div>
                        {settings.musicEnabled &&
                          selectedTrackIndex === index && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            </div>
                          )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    No tracks available.
                  </p>
                )}

                <p className="text-xs text-muted-foreground mt-2">
                  Pick a track then press On — 30-second previews loop
                  continuously.
                </p>
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
                <p className="text-sm font-medium mb-3">Session Stats</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p
                      className="text-2xl font-bold"
                      style={{
                        color: isDark ? "hsl(330,60%,70%)" : "hsl(330,80%,42%)",
                      }}
                    >
                      {stats.total_sessions}
                    </p>
                    <p className="text-xs text-muted-foreground">Sessions</p>
                  </div>
                  <div>
                    <p
                      className="text-2xl font-bold"
                      style={{
                        color: isDark ? "hsl(210,60%,70%)" : "hsl(210,80%,42%)",
                      }}
                    >
                      {stats.total_minutes}
                    </p>
                    <p className="text-xs text-muted-foreground">Minutes</p>
                  </div>
                  <div>
                    <p
                      className="text-2xl font-bold"
                      style={{
                        color: isDark ? "hsl(38,70%,68%)" : "hsl(35,90%,38%)",
                      }}
                    >
                      {stats.total_points_earned}
                    </p>
                    <p className="text-xs text-muted-foreground">SP Earned</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  10 points per minute studied
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Focus;
