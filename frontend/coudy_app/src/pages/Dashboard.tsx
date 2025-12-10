import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Calendar, Trophy, Flame, Award, Clock, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const mockUser = {
    name: "Emma Chen",
    level: 12,
    syncPoints: 3450,
    nextLevelPoints: 4000,
    rank: "Junior Achiever",
    avatar: "🎓",
    streak: 23,
  };

  const upcomingDeadlines = [
    { id: 1, title: "Calculus Midterm", course: "MATH 201", dueDate: "2 days", hours: 8, priority: "critical", progress: 60 },
    { id: 2, title: "History Essay", course: "HIST 301", dueDate: "4 days", hours: 5, priority: "high", progress: 30 },
    { id: 3, title: "Chemistry Lab Report", course: "CHEM 101", dueDate: "5 days", hours: 3, priority: "medium", progress: 80 },
  ];

  const todayHabits = [
    { id: 1, name: "Morning Review", completed: true, streak: 23 },
    { id: 2, name: "Exercise", completed: true, streak: 15 },
    { id: 3, name: "Study 2+ Hours", completed: false, streak: 0 },
    { id: 4, name: "Water Intake", completed: true, streak: 30 },
  ];

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
    switch (priority) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-secondary text-secondary-foreground";
      case "medium": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
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
                <p className="text-3xl font-bold mt-1">{todayHabits.filter(h => h.completed).length}/{todayHabits.length}</p>
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
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="glass p-4 rounded-2xl hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{deadline.title}</h3>
                      <p className="text-sm text-muted-foreground">{deadline.course}</p>
                    </div>
                    <Badge className={priorityColor(deadline.priority)}>
                      {deadline.dueDate}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{deadline.progress}%</span>
                    </div>
                    <Progress value={deadline.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Estimated: {deadline.hours} hours remaining
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Today's Habits */}
          <Card className="glass-card p-6 border-0">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-accent" />
              Today's Habits
            </h2>
            <div className="space-y-3">
              {todayHabits.map((habit) => (
                <div key={habit.id} className="glass p-4 rounded-2xl flex items-center justify-between hover:scale-102 transition-transform">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full ${habit.completed ? 'bg-accent' : 'bg-muted'} flex items-center justify-center`}>
                      {habit.completed && <span className="text-accent-foreground text-sm">✓</span>}
                    </div>
                    <div>
                      <p className="font-medium">{habit.name}</p>
                      {habit.streak > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Flame className="w-3 h-3" /> {habit.streak} day streak
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
    </div>
  );
};

export default Dashboard;
