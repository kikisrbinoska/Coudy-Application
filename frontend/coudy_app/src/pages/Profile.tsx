import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { User, Mail, Calendar, Trophy, Flame, Target, Settings } from "lucide-react";
import StudyTimer from "@/components/StudyTimer";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import StudyTimetable from "@/components/StudyTimetable";
import ProductivityInsights from "@/components/ProductivityInsights";

const Profile = () => {
  const user = {
    name: "Emma Chen",
    email: "emma.chen@university.edu",
    avatar: "EC",
    level: 12,
    syncPoints: 3450,
    nextLevelPoints: 4000,
    rank: "Junior Achiever",
    streak: 23,
    joinDate: "January 2024",
    badges: [
      { name: "Week Warrior", emoji: "🔥" },
      { name: "Quiz Master", emoji: "🎯" },
      { name: "Perfect Record", emoji: "🏆" },
      { name: "Early Bird", emoji: "🌅" },
    ],
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="glass-card p-6 md:p-8 border-0">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary">
              <AvatarFallback className="text-3xl font-bold bg-gradient-primary text-white">
                {user.avatar}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {user.joinDate}
                    </span>
                  </div>
                </div>
                <Button variant="outline" className="self-start md:self-auto">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="glass p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Level & Rank</span>
                  </div>
                  <p className="text-2xl font-bold">Level {user.level}</p>
                  <Badge className="mt-1 bg-primary/20 text-primary">{user.rank}</Badge>
                </div>

                <div className="glass p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-secondary" />
                    <span className="text-sm text-muted-foreground">Sync Points</span>
                  </div>
                  <p className="text-2xl font-bold">{user.syncPoints} SP</p>
                  <Progress value={(user.syncPoints / user.nextLevelPoints) * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.nextLevelPoints - user.syncPoints} SP to next level
                  </p>
                </div>

                <div className="glass p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted-foreground">Current Streak</span>
                  </div>
                  <p className="text-2xl font-bold">{user.streak} days</p>
                  <p className="text-xs text-muted-foreground mt-1">Don't break it!</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Badges Earned</p>
                <div className="flex gap-2 flex-wrap">
                  {user.badges.map((badge, index) => (
                    <div
                      key={index}
                      className="glass px-3 py-2 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                      <span className="text-2xl">{badge.emoji}</span>
                      <span className="text-sm font-medium">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Study Timer and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StudyTimer />
          <div className="lg:col-span-2">
            <ActivityHeatmap />
          </div>
        </div>

        {/* Productivity Insights */}
        <Card className="glass-card p-6 border-0">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Productivity Insights
          </h2>
          <ProductivityInsights />
        </Card>

        {/* Study Timetable */}
        <StudyTimetable />
      </div>
    </div>
  );
};

export default Profile;
