import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Target, Trophy, Flame, Award, Clock, Gamepad2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import habitApi, { HabitDto } from "@/api/habitApi";
import deadlineApi, { Deadline } from "@/api/deadlineApi";
import gameApi, { GameDto } from "@/api/gameApi";

const Dashboard = () => {
  const { user: authUser } = useAuth();
  const [todayHabits, setTodayHabits] = useState<HabitDto[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Deadline[]>([]);
  const [games, setGames] = useState<GameDto[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameDto | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    habitApi.getAll().then(setTodayHabits).catch(() => {});
    deadlineApi.getAll()
      .then((data) => setUpcomingDeadlines(data.filter((d) => d.status !== "COMPLETED")))
      .catch(() => {});
    gameApi.getAll().then(setGames).catch(() => {});
  }, []);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: direction === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  const difficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY": return "bg-accent text-accent-foreground";
      case "MEDIUM": return "bg-secondary text-secondary-foreground";
      case "HARD": return "bg-destructive text-destructive-foreground";
      case "EXPERT": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const displayName =
    authUser?.name && authUser?.surname
      ? `${authUser.name} ${authUser.surname}`
      : authUser?.username ?? "";

  const mockUser = {
    name: displayName,
    level: 12,
    syncPoints: 3450,
    nextLevelPoints: 4000,
    rank: "Junior Achiever",
    avatar: "🎓",
    streak: 23,
  };

  const studyBuddies = [
    { id: 1, name: "Alex Rivera", course: "MATH 201", avatar: "👨‍🎓", nextSession: "Today 3 PM" },
    { id: 2, name: "Sarah Kim", course: "HIST 301", avatar: "👩‍🎓", nextSession: "Tomorrow 2 PM" },
  ];

  const recentAchievements = [
    { id: 1, title: "Week Warrior", icon: "🔥", points: 200 },
    { id: 2, title: "Quiz Master", icon: "🎯", points: 150 },
    { id: 3, title: "Perfect Record", icon: "🏆", points: 300 },
  ];

  const priorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "CRITICAL": return "bg-destructive text-destructive-foreground";
      case "HIGH": return "bg-secondary text-secondary-foreground";
      case "MEDIUM": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatDueDate = (dateStr: string) => {
    const due = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days`;
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="text-6xl animate-float">{mockUser.avatar}</div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Welcome back, {mockUser.name}!
                </h1>
                <p className="text-muted-foreground mt-1">
                  Level {mockUser.level} • {mockUser.rank}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="font-semibold text-xl">{mockUser.syncPoints} SP</span>
              </div>
              <Progress value={(mockUser.syncPoints / mockUser.nextLevelPoints) * 100} className="w-32" />
              <span className="text-xs text-muted-foreground">{mockUser.nextLevelPoints - mockUser.syncPoints} SP to next level</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card p-6 border-0 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-bold mt-1">{mockUser.streak}</p>
              </div>
              <Flame className="w-12 h-12 text-secondary" />
            </div>
          </Card>
          
          <Card className="glass-card p-6 border-0 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Buddies</p>
                <p className="text-3xl font-bold mt-1">{studyBuddies.length}</p>
              </div>
              <Users className="w-12 h-12 text-accent" />
            </div>
          </Card>
          
          <Card className="glass-card p-6 border-0 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Habits</p>
                <p className="text-3xl font-bold mt-1">{todayHabits.filter(h => h.completedToday).length}/{todayHabits.length}</p>
              </div>
              <Target className="w-12 h-12 text-primary" />
            </div>
          </Card>
          
          <Card className="glass-card p-6 border-0 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-3xl font-bold mt-1">{recentAchievements.length}</p>
              </div>
              <Award className="w-12 h-12 text-secondary" />
            </div>
          </Card>
        </div>

        {/* Educational Games Carousel */}
        <Card className="glass-card p-6 border-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-primary" />
              Educational Games
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => scrollCarousel("left")}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => scrollCarousel("right")}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {games.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No games available yet.</p>
          ) : (
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
              style={{ scrollbarWidth: "none" }}
            >
              {games.map((game) => (
                <div
                  key={game.id}
                  className="glass rounded-2xl p-5 flex-shrink-0 w-56 hover:scale-105 transition-transform cursor-pointer"
                >
                  <div className="text-5xl mb-3 text-center">{game.icon}</div>
                  <h3 className="font-bold text-base mb-1 text-center">{game.name}</h3>
                  <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2">{game.description}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{game.subject}</span>
                    <Badge className={`text-xs ${difficultyColor(game.difficulty)}`}>
                      {game.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Lv. {game.level}</span>
                    <span className="text-xs font-semibold text-primary">+{game.points} SP</span>
                  </div>
                  <Button size="sm" className="w-full mt-3 gradient-primary border-0 text-xs" onClick={() => setSelectedGame(game)}>
                    Play Now
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deadline Countdown */}
          <Card className="glass-card p-6 border-0 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                Upcoming Deadlines
              </h2>
              <Link to="/deadlines">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines. Add some in the Deadlines tab!</p>
              ) : (
                upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="glass p-4 rounded-2xl hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{deadline.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {deadline.course?.code ?? deadline.course?.name ?? ""}
                        </p>
                      </div>
                      <Badge className={priorityColor(deadline.priority)}>
                        {formatDueDate(deadline.dueDate)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{deadline.completionPercentage}%</span>
                      </div>
                      <Progress value={deadline.completionPercentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Estimated: {deadline.estimatedHours} hours remaining
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Today's Habits */}
          <Card className="glass-card p-6 border-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Target className="w-6 h-6 text-accent" />
                Today's Habits
              </h2>
              <Link to="/habits">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {todayHabits.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No habits yet. Add some in the Habits tab!</p>
              ) : (
                todayHabits.map((habit) => (
                  <div key={habit.id} className="glass p-4 rounded-2xl flex items-center justify-between hover:scale-102 transition-transform">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full ${habit.completedToday ? 'bg-accent' : 'bg-muted'} flex items-center justify-center`}>
                        {habit.completedToday && <span className="text-accent-foreground text-sm">✓</span>}
                      </div>
                      <div>
                        <p className="font-medium">{habit.icon} {habit.name}</p>
                        {habit.streakCurrent > 0 && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Flame className="w-3 h-3" /> {habit.streakCurrent} day streak
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Study Buddies */}
          <Card className="glass-card p-6 border-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Study Buddies
              </h2>
              <Link to="/buddies">
                <Button variant="ghost" size="sm">Find More</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {studyBuddies.map((buddy) => (
                <div key={buddy.id} className="glass p-4 rounded-2xl hover:scale-102 transition-transform">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">{buddy.avatar}</div>
                    <div className="flex-1">
                      <p className="font-semibold">{buddy.name}</p>
                      <p className="text-xs text-muted-foreground">{buddy.course}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{buddy.nextSession}</span>
                    <Button size="sm" className="gradient-primary border-0">
                      <Users className="w-4 h-4 mr-1" />
                      Join Call
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Achievements */}
          <Card className="glass-card p-6 border-0 lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-secondary" />
              Recent Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="glass p-6 rounded-2xl text-center hover:scale-105 transition-transform">
                  <div className="text-5xl mb-3">{achievement.icon}</div>
                  <h3 className="font-semibold mb-1">{achievement.title}</h3>
                  <p className="text-sm text-primary font-medium">+{achievement.points} SP</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Game Placeholder Modal */}
      <Dialog open={!!selectedGame} onOpenChange={(open) => !open && setSelectedGame(null)}>
        <DialogContent className="glass-card border-0 max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedGame?.name}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {/* Jumping penguin animation */}
            <style>{`
              @keyframes penguin-jump {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                25%       { transform: translateY(-32px) rotate(-8deg); }
                50%       { transform: translateY(-40px) rotate(0deg); }
                75%       { transform: translateY(-32px) rotate(8deg); }
              }
              @keyframes shadow-pulse {
                0%, 100% { transform: scaleX(1); opacity: 0.4; }
                50%       { transform: scaleX(0.5); opacity: 0.15; }
              }
              .penguin-bounce { animation: penguin-jump 0.8s ease-in-out infinite; }
              .penguin-shadow { animation: shadow-pulse 0.8s ease-in-out infinite; }
            `}</style>

            <div className="relative flex flex-col items-center">
              <div className="penguin-bounce text-7xl select-none">🐧</div>
              <div className="penguin-shadow w-12 h-3 bg-black/20 rounded-full mt-1 blur-sm" />
            </div>

            <div>
              <p className="text-muted-foreground text-sm mb-1">{selectedGame?.description}</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <Badge className={selectedGame ? difficultyColor(selectedGame.difficulty) : ""}>
                  {selectedGame?.difficulty}
                </Badge>
                <span className="text-xs text-muted-foreground">{selectedGame?.subject}</span>
                <span className="text-xs font-semibold text-primary">+{selectedGame?.points} SP</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground italic">🚧 Game coming soon — stay tuned!</p>

            <Button className="gradient-primary border-0 w-full" onClick={() => setSelectedGame(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
