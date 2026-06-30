import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Lock, Loader2 } from "lucide-react";
import focusApi, { FocusStatsDto } from "@/api/focusApi";
import habitApi, { HabitDto } from "@/api/habitApi";
import deadlineApi, { Deadline } from "@/api/deadlineApi";
import studyBuddyApi, { StudyBuddyCard } from "@/api/studyBuddyApi";

type Rarity = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  rarity: Rarity;
  category: "Study" | "Deadlines" | "Habits" | "Social";
  current: number;
  target: number;
}

const Achievements = () => {
  const [loading, setLoading] = useState(true);
  const [focusStats, setFocusStats] = useState<FocusStatsDto>({ total_sessions: 0, total_minutes: 0, total_points_earned: 0 });
  const [habits, setHabits] = useState<HabitDto[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [buddies, setBuddies] = useState<StudyBuddyCard[]>([]);
  const [syncPoints, setSyncPoints] = useState(0);

  useEffect(() => {
    Promise.allSettled([
      focusApi.getStats().then(setFocusStats),
      habitApi.getAll().then(setHabits),
      deadlineApi.getAll().then(setDeadlines),
      studyBuddyApi.mine().then(setBuddies),
      focusApi.getPoints().then(setSyncPoints),
    ]).finally(() => setLoading(false));
  }, []);

  const longestStreak = habits.length ? Math.max(...habits.map((h) => h.streak_longest ?? 0)) : 0;
  const currentStreak = habits.length ? Math.max(...habits.map((h) => h.streak_current ?? 0)) : 0;
  const completedDeadlines = deadlines.filter((d) => d.status === "COMPLETED").length;
  const overdueDeadlines = deadlines.filter((d) => d.status === "OVERDUE").length;
  const totalStudyHours = Math.round((focusStats.total_minutes / 60) * 10) / 10;

  const achievementDefs: AchievementDef[] = [
    {
      id: "week-warrior",
      title: "Week Warrior",
      description: "Reach a 7-day habit streak",
      icon: "🔥",
      points: 200,
      rarity: "Epic",
      category: "Habits",
      current: currentStreak,
      target: 7,
    },
    {
      id: "perfect-record",
      title: "Perfect Record",
      description: "Complete 10 deadlines with zero overdue",
      icon: "🏆",
      points: 300,
      rarity: "Legendary",
      category: "Deadlines",
      current: overdueDeadlines === 0 ? completedDeadlines : 0,
      target: 10,
    },
    {
      id: "study-squad",
      title: "Study Squad",
      description: "Connect with 5 study buddies",
      icon: "🤝",
      points: 100,
      rarity: "Common",
      category: "Social",
      current: buddies.length,
      target: 5,
    },
    {
      id: "chain-maker",
      title: "Chain Maker",
      description: "Achieve a 30-day habit streak",
      icon: "🔗",
      points: 250,
      rarity: "Epic",
      category: "Habits",
      current: longestStreak,
      target: 30,
    },
    {
      id: "focus-marathon",
      title: "Focus Marathon",
      description: "Accumulate 50 hours of focused study",
      icon: "📚",
      points: 200,
      rarity: "Epic",
      category: "Study",
      current: totalStudyHours,
      target: 50,
    },
    {
      id: "sp-milestone",
      title: "Point Collector",
      description: "Earn 1000 Sync Points",
      icon: "⭐",
      points: 150,
      rarity: "Rare",
      category: "Study",
      current: syncPoints,
      target: 1000,
    },
    {
      id: "deadline-crusher",
      title: "Deadline Crusher",
      description: "Complete 10 deadlines",
      icon: "✅",
      points: 150,
      rarity: "Rare",
      category: "Deadlines",
      current: completedDeadlines,
      target: 10,
    },
    {
      id: "consistency-king",
      title: "Consistency King",
      description: "Maintain a 90-day habit streak",
      icon: "👑",
      points: 1000,
      rarity: "Mythic",
      category: "Habits",
      current: longestStreak,
      target: 90,
    },
    {
      id: "social-scholar",
      title: "Social Scholar",
      description: "Connect with 3 different study buddies",
      icon: "👥",
      points: 100,
      rarity: "Rare",
      category: "Social",
      current: buddies.length,
      target: 3,
    },
  ];

  const earnedAchievements = achievementDefs.filter((a) => a.current >= a.target);
  const lockedAchievements = achievementDefs
    .filter((a) => a.current < a.target)
    .map((a) => ({ ...a, progress: Math.min(100, Math.round((a.current / a.target) * 100)) }));

  const categoryCounts = achievementDefs.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1;
    return acc;
  }, {});

  const rarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-muted text-muted-foreground";
      case "Rare":
        return "bg-accent text-accent-foreground";
      case "Epic":
        return "bg-secondary text-secondary-foreground";
      case "Legendary":
        return "bg-primary text-primary-foreground";
      case "Mythic":
        return "gradient-primary text-white border-0";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

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
          <div className="flex items-center gap-4">
            <Trophy className="w-12 h-12 text-primary animate-float" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Achievements
              </h1>
              <p className="text-muted-foreground mt-2">
                Unlock badges and earn rewards for your progress
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card p-6 border-0">
            <div className="text-center">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-3xl font-bold">{earnedAchievements.length}</p>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
            </div>
          </Card>
          <Card className="glass-card p-6 border-0">
            <div className="text-center">
              <Star className="w-12 h-12 text-secondary mx-auto mb-3" />
              <p className="text-3xl font-bold">
                {earnedAchievements.reduce((sum, a) => sum + a.points, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Points from Badges</p>
            </div>
          </Card>
          <Card className="glass-card p-6 border-0">
            <div className="text-center">
              <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-3xl font-bold">{lockedAchievements.length}</p>
              <p className="text-sm text-muted-foreground">Still Locked</p>
            </div>
          </Card>
        </div>

        {/* Earned Achievements */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Achievements</h2>
          {earnedAchievements.length === 0 ? (
            <Card className="glass-card p-12 border-0 text-center">
              <p className="text-muted-foreground">No badges earned yet. Keep studying to unlock your first one!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className="glass-card p-6 border-0 hover:scale-105 transition-transform"
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4 animate-float">{achievement.icon}</div>
                    <Badge className={rarityColor(achievement.rarity)} variant="outline">
                      {achievement.rarity}
                    </Badge>
                    <h3 className="text-xl font-bold mt-3 mb-2">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                    <span className="text-primary font-bold text-sm">+{achievement.points} SP</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Locked Achievements */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lock className="w-6 h-6 text-muted-foreground" />
            Locked Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className="glass-card p-6 border-0 opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4 grayscale">{achievement.icon}</div>
                  <Badge className={rarityColor(achievement.rarity)} variant="outline">
                    {achievement.rarity}
                  </Badge>
                  <h3 className="text-xl font-bold mt-3 mb-2">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{achievement.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-primary transition-all"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                    <p className="text-primary font-bold text-sm">+{achievement.points} SP</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories */}
        <Card className="glass-card p-6 border-0">
          <h2 className="text-2xl font-bold mb-4">Achievement Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass p-4 rounded-2xl text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-2">📚</div>
              <h3 className="font-semibold">Study</h3>
              <p className="text-xs text-muted-foreground mt-1">{categoryCounts.Study ?? 0} badges</p>
            </div>
            <div className="glass p-4 rounded-2xl text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-2">📅</div>
              <h3 className="font-semibold">Deadlines</h3>
              <p className="text-xs text-muted-foreground mt-1">{categoryCounts.Deadlines ?? 0} badges</p>
            </div>
            <div className="glass p-4 rounded-2xl text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="font-semibold">Habits</h3>
              <p className="text-xs text-muted-foreground mt-1">{categoryCounts.Habits ?? 0} badges</p>
            </div>
            <div className="glass p-4 rounded-2xl text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-2">👥</div>
              <h3 className="font-semibold">Social</h3>
              <p className="text-xs text-muted-foreground mt-1">{categoryCounts.Social ?? 0} badges</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Achievements;
