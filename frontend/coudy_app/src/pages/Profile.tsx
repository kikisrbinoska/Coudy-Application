import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Calendar, Trophy, Flame, Target, Settings, Loader2 } from "lucide-react";
import StudyTimer from "@/components/StudyTimer";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import StudyTimetable from "@/components/StudyTimetable";
import ProductivityInsights from "@/components/ProductivityInsights";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import focusApi from "@/api/focusApi";
import habitApi, { HabitDto } from "@/api/habitApi";
import { authApi } from "@/api/authApi";
import { useToast } from "@/hooks/use-toast";

const SP_PER_LEVEL = 500;
const calcLevel = (sp: number) => Math.max(1, Math.floor(sp / SP_PER_LEVEL) + 1);

const Profile = () => {
  const { user: authUser, token, updateUser } = useAuth();
  const { toast } = useToast();
  const [syncPoints, setSyncPoints] = useState(0);
  const [habits, setHabits] = useState<HabitDto[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", surname: "", bio: "", major: "", year: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    focusApi.getPoints().then(setSyncPoints).catch(() => {});
    habitApi.getAll().then(setHabits).catch(() => {});
  }, []);

  const openEditProfile = () => {
    setEditForm({
      name: authUser?.name ?? "",
      surname: authUser?.surname ?? "",
      bio: authUser?.bio ?? "",
      major: authUser?.major ?? "",
      year: authUser?.year ?? "",
    });
    setEditOpen(true);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const updated = await authApi.updateMe(editForm);
      updateUser(updated);
      toast({ title: "Profile updated" });
      setEditOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const fullName =
    authUser?.name && authUser?.surname
      ? `${authUser.name} ${authUser.surname}`
      : authUser?.username ?? "";

  const avatarInitials = fullName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Extract join date from JWT iat claim
  let joinDate = "";
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.iat) {
        joinDate = new Date(payload.iat * 1000).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      }
    } catch {
      // ignore
    }
  }

  const level = calcLevel(syncPoints);
  const nextLevelPoints = level * SP_PER_LEVEL;
  const longestStreak = habits.length
    ? Math.max(...habits.map((h) => h.streak_current ?? 0))
    : 0;

  // Dynamically earn badges based on real data
  const earnedBadges: { name: string; emoji: string }[] = [];
  if (longestStreak >= 7) earnedBadges.push({ name: "Week Warrior", emoji: "🔥" });
  if (syncPoints >= 500) earnedBadges.push({ name: "SP Milestone", emoji: "⭐" });
  if (habits.length >= 3) earnedBadges.push({ name: "Habit Builder", emoji: "🎯" });
  if (level >= 2) earnedBadges.push({ name: "Level Up!", emoji: "🏆" });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="glass-card p-6 md:p-8 border-0">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary">
              <AvatarFallback className="text-3xl font-bold bg-gradient-primary text-white">
                {avatarInitials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{fullName}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {authUser?.username ?? ""}
                    </span>
                    {joinDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined {joinDate}
                      </span>
                    )}
                    {(authUser?.major || authUser?.year) && (
                      <span>
                        {[authUser?.major, authUser?.year].filter(Boolean).join(" • ")}
                      </span>
                    )}
                  </div>
                  {authUser?.bio && (
                    <p className="text-sm text-muted-foreground mt-2 max-w-xl">{authUser.bio}</p>
                  )}
                </div>
                <Button variant="outline" className="self-start md:self-auto" onClick={openEditProfile}>
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
                  <p className="text-2xl font-bold">Level {level}</p>
                  <Badge className="mt-1 bg-primary/20 text-primary">Junior Achiever</Badge>
                </div>

                <div className="glass p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-secondary" />
                    <span className="text-sm text-muted-foreground">Sync Points</span>
                  </div>
                  <p className="text-2xl font-bold">{syncPoints} SP</p>
                  <Progress value={(syncPoints / nextLevelPoints) * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {nextLevelPoints - syncPoints} SP to next level
                  </p>
                </div>

                <div className="glass p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted-foreground">Current Streak</span>
                  </div>
                  <p className="text-2xl font-bold">{longestStreak} days</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {longestStreak > 0 ? "Keep it going!" : "Start a habit to build your streak!"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Badges Earned</p>
                {earnedBadges.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Complete habits and earn SP to unlock badges!</p>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {earnedBadges.map((badge, index) => (
                      <div
                        key={index}
                        className="glass px-3 py-2 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <span className="text-2xl">{badge.emoji}</span>
                        <span className="text-sm font-medium">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Study Timer and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StudyTimer onPointsUpdated={setSyncPoints} />
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">First Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-surname">Last Name</Label>
                <Input
                  id="edit-surname"
                  value={editForm.surname}
                  onChange={(e) => setEditForm((f) => ({ ...f, surname: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-major">Major</Label>
              <Input
                id="edit-major"
                value={editForm.major}
                onChange={(e) => setEditForm((f) => ({ ...f, major: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-year">Year</Label>
              <Input
                id="edit-year"
                value={editForm.year}
                onChange={(e) => setEditForm((f) => ({ ...f, year: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                rows={3}
                value={editForm.bio}
                onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>
            <Button
              className="w-full gradient-primary border-0"
              onClick={saveProfile}
              disabled={savingProfile}
            >
              {savingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
