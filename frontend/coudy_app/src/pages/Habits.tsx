import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Flame, TrendingUp, Plus, CheckCircle2 } from "lucide-react";

const Habits = () => {
  const habits = [
    {
      id: 1,
      name: "Morning Review",
      category: "Academic",
      streak: 23,
      longestStreak: 45,
      completionRate: 92,
      completed: true,
      icon: "📚",
    },
    {
      id: 2,
      name: "Exercise",
      category: "Wellness",
      streak: 15,
      longestStreak: 30,
      completionRate: 78,
      completed: true,
      icon: "💪",
    },
    {
      id: 3,
      name: "Study 2+ Hours",
      category: "Academic",
      streak: 0,
      longestStreak: 18,
      completionRate: 85,
      completed: false,
      icon: "⏰",
    },
    {
      id: 4,
      name: "Water Intake (8 cups)",
      category: "Wellness",
      streak: 30,
      longestStreak: 30,
      completionRate: 95,
      completed: true,
      icon: "💧",
    },
    {
      id: 5,
      name: "8 Hours Sleep",
      category: "Wellness",
      streak: 12,
      longestStreak: 21,
      completionRate: 71,
      completed: true,
      icon: "😴",
    },
    {
      id: 6,
      name: "Note Organization",
      category: "Academic",
      streak: 7,
      longestStreak: 14,
      completionRate: 68,
      completed: false,
      icon: "📝",
    },
  ];

  const categoryColor = (category: string) => {
    switch (category) {
      case "Academic":
        return "bg-primary text-primary-foreground";
      case "Wellness":
        return "bg-accent text-accent-foreground";
      case "Life Balance":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const weekData = [
    { day: "Mon", completed: 5 },
    { day: "Tue", completed: 6 },
    { day: "Wed", completed: 5 },
    { day: "Thu", completed: 4 },
    { day: "Fri", completed: 6 },
    { day: "Sat", completed: 5 },
    { day: "Sun", completed: 4 },
  ];

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
            <Button className="gradient-primary border-0">
              <Plus className="w-5 h-5 mr-2" />
              Add Habit
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Progress</p>
                <p className="text-3xl font-bold mt-1">
                  {habits.filter((h) => h.completed).length}/{habits.length}
                </p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
          </Card>
          <Card className="glass-card p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-3xl font-bold mt-1">
                  {Math.max(...habits.map((h) => h.longestStreak))}
                </p>
              </div>
              <Flame className="w-10 h-10 text-secondary" />
            </div>
          </Card>
          <Card className="glass-card p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-3xl font-bold mt-1">
                  {Math.round(habits.reduce((sum, h) => sum + h.completionRate, 0) / habits.length)}%
                </p>
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
          <div className="flex justify-around items-end h-48 gap-2">
            {weekData.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full gradient-primary rounded-t-xl transition-all hover:scale-105"
                  style={{ height: `${(day.completed / 6) * 100}%` }}
                />
                <span className="text-sm font-medium">{day.day}</span>
                <span className="text-xs text-muted-foreground">{day.completed}/6</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Habits Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Habits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => (
              <Card
                key={habit.id}
                className={`glass-card p-6 border-0 hover:shadow-xl transition-all ${
                  habit.completed ? "border-2 border-accent" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{habit.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold">{habit.name}</h3>
                      <Badge className={categoryColor(habit.category)} variant="outline">
                        {habit.category}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={habit.completed ? "default" : "outline"}
                    className={habit.completed ? "gradient-accent border-0" : "glass"}
                  >
                    {habit.completed ? "✓ Done" : "Complete"}
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Flame className="w-4 h-4 text-secondary" />
                      <p className="text-2xl font-bold">{habit.streak}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Current Streak</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{habit.longestStreak}</p>
                    <p className="text-xs text-muted-foreground">Best Streak</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{habit.completionRate}%</p>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                  </div>
                </div>

                {habit.streak === 0 && !habit.completed && (
                  <div className="glass p-3 rounded-xl text-sm mt-4">
                    <p>
                      <strong>⚠️ Streak broken!</strong> Complete today to start building again.
                    </p>
                  </div>
                )}
                {habit.streak >= 7 && (
                  <div className="glass p-3 rounded-xl text-sm mt-4">
                    <p>
                      <strong>🔥 Great momentum!</strong> You're on a {habit.streak}-day streak!
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <Card className="glass-card p-6 border-0">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-accent" />
            AI Insights
          </h2>
          <div className="space-y-3">
            <div className="glass p-4 rounded-2xl">
              <p>
                <strong>✨ Pattern Detected:</strong> You complete habits 80% more on days when you
                exercise first thing in the morning.
              </p>
            </div>
            <div className="glass p-4 rounded-2xl">
              <p>
                <strong>💤 Sleep Impact:</strong> Getting 8+ hours of sleep correlates with 35%
                higher study effectiveness.
              </p>
            </div>
            <div className="glass p-4 rounded-2xl">
              <p>
                <strong>🎯 Recommendation:</strong> You're most consistent with morning habits.
                Consider moving "Note Organization" to 8 AM for better results.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Habits;
