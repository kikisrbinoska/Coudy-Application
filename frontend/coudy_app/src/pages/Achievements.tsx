import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Lock } from "lucide-react";

const Achievements = () => {
  const earnedAchievements = [
    {
      id: 1,
      title: "Week Warrior",
      description: "Study for 7 consecutive days",
      icon: "🔥",
      points: 200,
      rarity: "Epic",
      earnedDate: "Dec 1, 2024",
    },
    {
      id: 2,
      title: "Quiz Master",
      description: "Complete 25 AI-generated quizzes",
      icon: "🎯",
      points: 150,
      rarity: "Rare",
      earnedDate: "Nov 28, 2024",
    },
    {
      id: 3,
      title: "Perfect Record",
      description: "30 days with zero late submissions",
      icon: "🏆",
      points: 300,
      rarity: "Legendary",
      earnedDate: "Nov 25, 2024",
    },
    {
      id: 4,
      title: "Study Squad",
      description: "Complete 10 study buddy sessions",
      icon: "🤝",
      points: 100,
      rarity: "Common",
      earnedDate: "Nov 20, 2024",
    },
    {
      id: 5,
      title: "Chain Maker",
      description: "Achieve 30-day habit streak",
      icon: "🔗",
      points: 250,
      rarity: "Epic",
      earnedDate: "Nov 15, 2024",
    },
    {
      id: 6,
      title: "Early Bird",
      description: "Study before 8 AM for 7 days",
      icon: "☀️",
      points: 100,
      rarity: "Rare",
      earnedDate: "Nov 10, 2024",
    },
  ];

  const lockedAchievements = [
    {
      id: 7,
      title: "Phoenix Rising",
      description: "Recover from crisis mode and complete all deadlines",
      icon: "🔥",
      points: 500,
      rarity: "Legendary",
      progress: 60,
    },
    {
      id: 8,
      title: "Consistency King",
      description: "Maintain 90-day habit streak",
      icon: "👑",
      points: 1000,
      rarity: "Mythic",
      progress: 33,
    },
    {
      id: 9,
      title: "Social Scholar",
      description: "Match with 5 different study buddies",
      icon: "👥",
      points: 150,
      rarity: "Rare",
      progress: 40,
    },
    {
      id: 10,
      title: "Marathon Master",
      description: "Study 5+ hours in one day",
      icon: "📚",
      points: 200,
      rarity: "Epic",
      progress: 0,
    },
  ];

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
                  <div className="flex justify-center gap-4 text-sm">
                    <div>
                      <span className="text-primary font-bold">+{achievement.points} SP</span>
                    </div>
                    <div className="text-muted-foreground">{achievement.earnedDate}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
              <p className="text-xs text-muted-foreground mt-1">15 badges</p>
            </div>
            <div className="glass p-4 rounded-2xl text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-2">📅</div>
              <h3 className="font-semibold">Deadlines</h3>
              <p className="text-xs text-muted-foreground mt-1">12 badges</p>
            </div>
            <div className="glass p-4 rounded-2xl text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="font-semibold">Habits</h3>
              <p className="text-xs text-muted-foreground mt-1">18 badges</p>
            </div>
            <div className="glass p-4 rounded-2xl text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-2">👥</div>
              <h3 className="font-semibold">Social</h3>
              <p className="text-xs text-muted-foreground mt-1">10 badges</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Achievements;
