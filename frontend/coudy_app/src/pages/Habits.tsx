import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, Flame, TrendingUp, Plus, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import habitApi, {
  HabitDto,
  WeeklySummary,
  HabitCategory,
  TargetFrequency,
  CreateHabitRequest,
} from "@/api/habitApi";

const CATEGORY_LABELS: Record<HabitCategory, string> = {
  ACADEMIC: "Academic",
  WELLNESS: "Wellness",
  LIFE_BALANCE: "Life Balance",
};

const CATEGORY_COLORS: Record<HabitCategory, string> = {
  ACADEMIC: "bg-primary text-primary-foreground",
  WELLNESS: "bg-accent text-accent-foreground",
  LIFE_BALANCE: "bg-secondary text-secondary-foreground",
};

const DEFAULT_ICON = "⭐";

const Habits = () => {
  const [habits, setHabits] = useState<HabitDto[]>([]);
  const [weekData, setWeekData] = useState<WeeklySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateHabitRequest>({
    name: "",
    icon: DEFAULT_ICON,
    category: "ACADEMIC",
    targetFrequency: "DAILY",
    reminderTime: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [habitsData, weeklyData] = await Promise.all([
        habitApi.getAll(),
        habitApi.getWeeklySummary(),
      ]);
      setHabits(habitsData);
      setWeekData(weeklyData);
    } catch {
      // errors handled by interceptor (401 redirect)
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: number) => {
    setCompletingId(id);
    try {
      const updated = await habitApi.completeToday(id);
      setHabits((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
      const weeklyData = await habitApi.getWeeklySummary();
      setWeekData(weeklyData);
    } catch {
      // ignore
    } finally {
      setCompletingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await habitApi.delete(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const created = await habitApi.create(form);
      setHabits((prev) => [...prev, created]);
      setDialogOpen(false);
      setForm({ name: "", icon: DEFAULT_ICON, category: "ACADEMIC", targetFrequency: "DAILY", reminderTime: null });
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const maxWeekCompleted = Math.max(...weekData.map((d) => d.completed), 1);
  const completedToday = habits.filter((h) => h.completedToday).length;
  const longestStreak = habits.length ? Math.max(...habits.map((h) => h.streakLongest)) : 0;
  const avgCompletion = habits.length
    ? Math.round(habits.reduce((s, h) => s + h.completionRate, 0) / habits.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Habit Tracker
              </h1>
              <p className="text-muted-foreground mt-2">Build consistency, one day at a time</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary border-0">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Habit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Habit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <Label>Name</Label>
                    <Input
                      placeholder="e.g. Morning Review"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Icon (emoji)</Label>
                    <Input
                      placeholder="📚"
                      value={form.icon}
                      onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm((f) => ({ ...f, category: v as HabitCategory }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACADEMIC">Academic</SelectItem>
                        <SelectItem value="WELLNESS">Wellness</SelectItem>
                        <SelectItem value="LIFE_BALANCE">Life Balance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Frequency</Label>
                    <Select
                      value={form.targetFrequency}
                      onValueChange={(v) => setForm((f) => ({ ...f, targetFrequency: v as TargetFrequency }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full gradient-primary border-0"
                    onClick={handleCreate}
                    disabled={creating || !form.name.trim()}
                  >
                    {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Habit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Progress</p>
                <p className="text-3xl font-bold mt-1">
                  {completedToday}/{habits.length}
                </p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
          </Card>
          <Card className="glass-card p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-3xl font-bold mt-1">{longestStreak}</p>
              </div>
              <Flame className="w-10 h-10 text-secondary" />
            </div>
          </Card>
          <Card className="glass-card p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-3xl font-bold mt-1">{avgCompletion}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-accent" />
            </div>
          </Card>
          <Card className="glass-card p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Habits</p>
                <p className="text-3xl font-bold mt-1">{habits.length}</p>
              </div>
              <Target className="w-10 h-10 text-primary" />
            </div>
          </Card>
        </div>

        {/* Weekly Overview */}
        <Card className="glass-card p-6 border-0">
          <h2 className="text-2xl font-bold mb-6">This Week's Activity</h2>
          {weekData.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activity yet this week.</p>
          ) : (
            <div className="flex justify-around items-end h-48 gap-2">
              {weekData.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full gradient-primary rounded-t-xl transition-all hover:scale-105"
                    style={{
                      height: `${(day.completed / maxWeekCompleted) * 100}%`,
                      minHeight: day.completed > 0 ? "8px" : "2px",
                    }}
                  />
                  <span className="text-sm font-medium">{day.day}</span>
                  <span className="text-xs text-muted-foreground">{day.completed}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Habits Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Habits</h2>
          {habits.length === 0 ? (
            <Card className="glass-card p-12 border-0 text-center">
              <p className="text-muted-foreground">No habits yet. Add your first habit to get started!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.map((habit) => (
                <Card
                  key={habit.id}
                  className={`glass-card p-6 border-0 hover:shadow-xl transition-all ${
                    habit.completedToday ? "border-2 border-accent" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{habit.icon || DEFAULT_ICON}</div>
                      <div>
                        <h3 className="text-xl font-bold">{habit.name}</h3>
                        <Badge
                          className={CATEGORY_COLORS[habit.category] ?? "bg-muted text-muted-foreground"}
                          variant="outline"
                        >
                          {CATEGORY_LABELS[habit.category] ?? habit.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={habit.completedToday ? "default" : "outline"}
                        className={habit.completedToday ? "gradient-accent border-0" : "glass"}
                        onClick={() => !habit.completedToday && handleComplete(habit.id)}
                        disabled={habit.completedToday || completingId === habit.id}
                      >
                        {completingId === habit.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : habit.completedToday ? (
                          "✓ Done"
                        ) : (
                          "Complete"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(habit.id)}
                        disabled={deletingId === habit.id}
                      >
                        {deletingId === habit.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Flame className="w-4 h-4 text-secondary" />
                        <p className="text-2xl font-bold">{habit.streakCurrent}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Current Streak</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{habit.streakLongest}</p>
                      <p className="text-xs text-muted-foreground">Best Streak</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{habit.completionRate}%</p>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                    </div>
                  </div>

                  {habit.streakCurrent === 0 && !habit.completedToday && habit.totalCompletions > 0 && (
                    <div className="glass p-3 rounded-xl text-sm mt-4">
                      <p>
                        <strong>⚠️ Streak broken!</strong> Complete today to start building again.
                      </p>
                    </div>
                  )}
                  {habit.streakCurrent >= 7 && (
                    <div className="glass p-3 rounded-xl text-sm mt-4">
                      <p>
                        <strong>🔥 Great momentum!</strong> You're on a {habit.streakCurrent}-day streak!
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Habits;
