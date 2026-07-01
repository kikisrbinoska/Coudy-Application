import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Target, Trophy, Flame, Award, Clock, Gamepad2, ChevronLeft, ChevronRight, Play, Pause, Square, BookOpen, TrendingUp, BarChart2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef, useCallback } from "react";
import habitApi, { HabitDto } from "@/api/habitApi";
import deadlineApi, { Deadline } from "@/api/deadlineApi";
import gameApi, { GameDto } from "@/api/gameApi";
import focusApi, { FocusStatsDto } from "@/api/focusApi";
import quizApi, { CourseStat } from "@/api/quizApi";
import courseApi from "@/api/courseApi";
import studyBuddyApi, { StudyBuddyCard } from "@/api/studyBuddyApi";

const SP_PER_LEVEL = 500;
const calcLevel = (sp: number) => Math.max(1, Math.floor(sp / SP_PER_LEVEL) + 1);

const buddyInitials = (name?: string, surname?: string, username?: string) => {
  const source = name || surname ? `${name ?? ""} ${surname ?? ""}` : username ?? "";
  return source
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SB";
};

const Dashboard = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  // Core data
  const [todayHabits, setTodayHabits] = useState<HabitDto[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Deadline[]>([]);
  const [games, setGames] = useState<GameDto[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameDto | null>(null);
  const [syncPoints, setSyncPoints] = useState<number>(0);
  const [focusStats, setFocusStats] = useState<FocusStatsDto>({ total_sessions: 0, total_minutes: 0, total_points_earned: 0 });
  const [weeklyHabits, setWeeklyHabits] = useState<{ day: string; completed: number }[]>([]);
  const [quizCourses, setQuizCourses] = useState<string[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStat[]>([]);
  const [courses, setCourses] = useState<{ id: number; name?: string; code?: string }[]>([]);
  const [studyBuddies, setStudyBuddies] = useState<StudyBuddyCard[]>([]);

  // Study timer (mirrors Focus page)
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionSaving, setSessionSaving] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    await Promise.allSettled([
      habitApi.getAll().then(setTodayHabits),
      habitApi.getWeeklySummary().then(setWeeklyHabits),
      deadlineApi.getAll().then((data) => setUpcomingDeadlines(data.filter((d) => d.status !== "COMPLETED"))),
      gameApi.getAll().then(setGames),
      focusApi.getPoints().then(setSyncPoints),
      focusApi.getStats().then(setFocusStats),
      quizApi.getCourses().then(setQuizCourses),
      quizApi.getCourseStats().then(setCourseStats),
      courseApi.getAll().then(setCourses),
      studyBuddyApi.mine().then(setStudyBuddies),
    ]);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Timer
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const handleStop = async () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (time === 0) return;
    const elapsed = time;
    setTime(0);
    setSessionSaving(true);
    try {
      const result = await focusApi.createSession(elapsed);
      setSyncPoints(result.new_total_points);
      setFocusStats((prev) => ({
        total_sessions: prev.total_sessions + 1,
        total_minutes: prev.total_minutes + Math.floor(elapsed / 60),
        total_points_earned: prev.total_points_earned + result.points_earned,
      }));
    } catch {
      // ignore
    } finally {
      setSessionSaving(false);
    }
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const scrollCarousel = (dir: "left" | "right") => {
    carouselRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  const difficultyColor = (d: string) => {
    switch (d) {
      case "EASY": return "bg-accent text-accent-foreground";
      case "MEDIUM": return "bg-secondary text-secondary-foreground";
      case "HARD": return "bg-destructive text-destructive-foreground";
      case "EXPERT": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const priorityColor = (p: string) => {
    switch (p.toUpperCase()) {
      case "CRITICAL": return "bg-destructive text-destructive-foreground";
      case "HIGH": return "bg-secondary text-secondary-foreground";
      case "MEDIUM": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const parseDueDate = (val: string | number[] | undefined): Date => {
    if (!val) return new Date(NaN);
    if (Array.isArray(val)) {
      const [year, month, day, hour = 0, min = 0] = val as number[];
      return new Date(year, month - 1, day, hour, min);
    }
    return new Date(val as string);
  };

  const formatDueDate = (val: string | number[] | undefined) => {
    const due = parseDueDate(val);
    if (isNaN(due.getTime())) return "No date";
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days`;
    const w = Math.floor(diffDays / 7);
    return `${w} week${w > 1 ? "s" : ""}`;
  };

  const displayName = authUser?.name && authUser?.surname
    ? `${authUser.name} ${authUser.surname}`
    : authUser?.username ?? "";

  const level = calcLevel(syncPoints);
  const nextLevelPoints = level * SP_PER_LEVEL;
  const estimatedPoints = Math.floor(time / 60) * 10;

  // Weekly study hours breakdown (7 days, approximated from total minutes / sessions)
  const avgMinutesPerSession = focusStats.total_sessions > 0
    ? Math.round(focusStats.total_minutes / focusStats.total_sessions)
    : 0;

  // Subject distribution: real completed quiz session counts per course
  const subjectColors = ["bg-primary", "bg-secondary", "bg-accent", "bg-destructive", "bg-muted"];
  const totalCompletedSessions = courseStats.reduce((sum, c) => sum + c.completed_sessions, 0);
  const sortedCourseStats = [...courseStats].sort((a, b) => b.completed_sessions - a.completed_sessions);

  // Weekly habit activity bar chart
  const maxHabitDay = Math.max(...weeklyHabits.map((d) => d.completed), 1);

  const longestStreak = todayHabits.length
    ? Math.max(...todayHabits.map((h) => h.streak_current ?? 0))
    : 0;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="text-6xl animate-float">🎓</div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Welcome back, {displayName}!
                </h1>
                <p className="text-muted-foreground mt-1">Level {level} • Junior Achiever</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="font-semibold text-xl">{syncPoints} SP</span>
              </div>
              <Progress value={(syncPoints / nextLevelPoints) * 100} className="w-32" />
              <span className="text-xs text-muted-foreground">{nextLevelPoints - syncPoints} SP to next level</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card p-6 border-0 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-bold mt-1">{longestStreak}</p>
              </div>
              <Flame className="w-12 h-12 text-secondary" />
            </div>
          </Card>
          <Card className="glass-card p-6 border-0 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Sessions</p>
                <p className="text-3xl font-bold mt-1">{focusStats.total_sessions}</p>
              </div>
              <Clock className="w-12 h-12 text-accent" />
            </div>
          </Card>
          <Card className="glass-card p-6 border-0 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Habits</p>
                <p className="text-3xl font-bold mt-1">{todayHabits.filter((h) => h.completed_today).length}/{todayHabits.length}</p>
              </div>
              <Target className="w-12 h-12 text-primary" />
            </div>
          </Card>
          <Card className="glass-card p-6 border-0 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Study Mins</p>
                <p className="text-3xl font-bold mt-1">{focusStats.total_minutes}</p>
              </div>
              <Award className="w-12 h-12 text-secondary" />
            </div>
          </Card>
        </div>

        {/* Study Timer */}
        <Card className="glass-card p-6 border-0">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Study Timer
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-6xl font-mono font-bold tracking-wider text-primary">
              {formatTime(time)}
            </div>
            <div className="flex gap-3">
              {!isRunning ? (
                <Button className="gradient-primary border-0" onClick={() => setIsRunning(true)} disabled={sessionSaving}>
                  <Play className="w-5 h-5 mr-2" /> Start
                </Button>
              ) : (
                <Button variant="outline" className="glass" onClick={() => setIsRunning(false)}>
                  <Pause className="w-5 h-5 mr-2" /> Pause
                </Button>
              )}
              <Button variant="outline" className="glass" onClick={handleStop} disabled={time === 0 || sessionSaving}>
                <Square className="w-5 h-5 mr-2" /> {sessionSaving ? "Saving..." : "Stop & Save"}
              </Button>
            </div>
            {time > 0 && (
              <p className="text-sm text-muted-foreground">
                Earning <span className="text-primary font-semibold">+{estimatedPoints} SP</span> this session
              </p>
            )}
            <div className="ml-auto flex gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{focusStats.total_sessions}</p>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{Math.round(focusStats.total_minutes / 60 * 10) / 10}h</p>
                <p className="text-xs text-muted-foreground">Total Hours</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{focusStats.total_points_earned}</p>
                <p className="text-xs text-muted-foreground">SP Earned</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Weekly Habit Activity */}
          <Card className="glass-card p-6 border-0">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" />
              This Week's Activity
            </h2>
            {weeklyHabits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No habit activity yet this week.</p>
            ) : (
              <div className="flex justify-around items-end h-32 gap-1">
                {weeklyHabits.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full gradient-primary rounded-t-lg transition-all"
                      style={{ height: `${(day.completed / maxHabitDay) * 100}%`, minHeight: day.completed > 0 ? "6px" : "2px" }}
                    />
                    <span className="text-xs font-medium">{day.day.slice(0, 3)}</span>
                    <span className="text-xs text-muted-foreground">{day.completed}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Productivity Insights */}
          <Card className="glass-card p-6 border-0">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Productivity Insights
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Avg session length</span>
                  <span className="font-medium">{avgMinutesPerSession} min</span>
                </div>
                <Progress value={Math.min((avgMinutesPerSession / 60) * 100, 100)} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Habits done today</span>
                  <span className="font-medium">
                    {todayHabits.filter((h) => h.completed_today).length}/{todayHabits.length}
                  </span>
                </div>
                <Progress
                  value={todayHabits.length > 0 ? (todayHabits.filter((h) => h.completed_today).length / todayHabits.length) * 100 : 0}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Weekly study hours</span>
                  <span className="font-medium">{Math.round(focusStats.total_minutes / 60 * 10) / 10}h total</span>
                </div>
                <Progress value={Math.min((focusStats.total_minutes / 600) * 100, 100)} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Upcoming deadlines</span>
                  <span className="font-medium">{upcomingDeadlines.length}</span>
                </div>
                <Progress value={Math.min(upcomingDeadlines.length * 10, 100)} className="h-2" />
              </div>
            </div>
          </Card>

          {/* Subject Distribution */}
          <Card className="glass-card p-6 border-0">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              Subject Distribution
            </h2>
            {sortedCourseStats.length === 0 && courses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Take quizzes to see your subject activity.</p>
            ) : (
              <div className="space-y-3">
                {sortedCourseStats.slice(0, 5).map((stat, i) => {
                  const pct = totalCompletedSessions > 0
                    ? Math.round((stat.completed_sessions / totalCompletedSessions) * 100)
                    : 0;
                  return (
                    <div key={stat.course}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground truncate max-w-[140px]">{stat.course}</span>
                        <span className="text-xs font-medium text-primary">{pct}% ({stat.completed_sessions})</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className={`${subjectColors[i % subjectColors.length]} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {courses.filter((c) => !sortedCourseStats.some((s) => s.course === c.name)).slice(0, 3).map((c) => (
                  <div key={c.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground truncate max-w-[140px]">{c.code ? `${c.code} - ${c.name}` : c.name}</span>
                      <span className="text-xs text-muted-foreground">No quizzes yet</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-muted-foreground/30 h-2 rounded-full" style={{ width: "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              <Button variant="ghost" size="icon" onClick={() => scrollCarousel("left")}><ChevronLeft className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => scrollCarousel("right")}><ChevronRight className="w-5 h-5" /></Button>
            </div>
          </div>
          {games.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No games available yet.</p>
          ) : (
            <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: "none" }}>
              {games.map((game) => (
                <div key={game.id} className="glass rounded-2xl p-5 flex-shrink-0 w-56 hover:scale-105 transition-transform cursor-pointer">
                  <div className="text-5xl mb-3 text-center">{game.icon}</div>
                  <h3 className="font-bold text-base mb-1 text-center">{game.name}</h3>
                  <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2">{game.description}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{game.subject}</span>
                    <Badge className={`text-xs ${difficultyColor(game.difficulty)}`}>{game.difficulty}</Badge>
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
          {/* Upcoming Deadlines */}
          <Card className="glass-card p-6 border-0 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                Upcoming Deadlines
              </h2>
              <Link to="/deadlines"><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
            <div className="space-y-4">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines.</p>
              ) : (
                upcomingDeadlines.slice(0, 3).map((deadline) => {
                  const pct = deadline.completion_percentage ?? 0;
                  const dueDateStr = formatDueDate(deadline.due_date);
                  const noDate = dueDateStr === "No date";
                  return (
                  <div key={deadline.id} className="glass p-4 rounded-2xl hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{deadline.title}</h3>
                        <p className="text-sm text-muted-foreground">{deadline.course?.code ?? deadline.course?.name ?? ""}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={priorityColor(deadline.priority)}>{deadline.priority}</Badge>
                        <span className={`text-xs font-medium ${noDate ? "text-muted-foreground" : dueDateStr === "Overdue" ? "text-destructive" : "text-primary"}`}>
                          {noDate ? "No due date set" : `Due: ${dueDateStr}`}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-2 bg-muted" />
                      <p className="text-xs text-muted-foreground">
                        {deadline.estimated_hours
                          ? `~${Math.round(deadline.estimated_hours * (1 - pct / 100))}h remaining of ${deadline.estimated_hours}h`
                          : "No estimate set"}
                      </p>
                    </div>
                  </div>
                  );
                })
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
              <Link to="/habits"><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
            <div className="space-y-3">
              {todayHabits.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No habits yet.</p>
              ) : (
                todayHabits.map((habit) => (
                  <div key={habit.id} className="glass p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full ${habit.completed_today ? "bg-accent" : "bg-muted"} flex items-center justify-center`}>
                        {habit.completed_today && <span className="text-accent-foreground text-sm">✓</span>}
                      </div>
                      <div>
                        <p className="font-medium">{habit.icon} {habit.name}</p>
                        {(habit.streak_current ?? 0) > 0 && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Flame className="w-3 h-3" /> {habit.streak_current} day streak
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Study Buddies placeholder */}
          <Card className="glass-card p-6 border-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Study Buddies
              </h2>
              <Link to="/buddies"><Button variant="ghost" size="sm">Find More</Button></Link>
            </div>
            {studyBuddies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Connect with study buddies in the Buddies tab!</p>
            ) : (
              <div className="space-y-3">
                {studyBuddies.slice(0, 4).map((buddy) => (
                  <Link
                    key={buddy.id ?? buddy.username}
                    to={buddy.id ? `/buddies?tab=mybuddies&buddyId=${buddy.id}` : "/buddies?tab=mybuddies"}
                    className="glass p-3 rounded-2xl flex items-center gap-3 hover:scale-[1.02] transition-transform"
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-primary text-white flex items-center justify-center text-sm font-bold">
                        {buddyInitials(buddy.name, buddy.surname, buddy.username)}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${buddy.status === "ACTIVE" ? "bg-accent" : "bg-muted"} border-2 border-white`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {buddy.name ?? buddy.username}{buddy.surname ? ` ${buddy.surname}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {buddy.courses[0] ?? buddy.major ?? "Study buddy"}
                      </p>
                    </div>
                    {((buddy.unread_count ?? 0) > 0) && (
                      <Badge className="bg-red-500 text-white border-0 shrink-0">
                        {buddy.unread_count > 99 ? "99+" : buddy.unread_count}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Quiz Activity */}
          <Card className="glass-card p-6 border-0 lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-secondary" />
              Quiz Activity
            </h2>
            {quizCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No quiz activity yet. Start a quiz from the Courses tab!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quizCourses.slice(0, 6).map((course) => (
                  <button
                    key={course}
                    type="button"
                    onClick={() => navigate("/courses", { state: { openCourse: course } })}
                    className="glass p-4 rounded-2xl text-center hover:scale-105 transition-transform cursor-pointer"
                  >
                    <div className="text-3xl mb-2">📚</div>
                    <h3 className="font-semibold text-sm mb-1 truncate">{course}</h3>
                    <p className="text-xs text-primary font-medium">Quiz available</p>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Game Modal */}
      <Dialog open={!!selectedGame} onOpenChange={(open) => !open && setSelectedGame(null)}>
        <DialogContent className="glass-card border-0 max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedGame?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
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
                <Badge className={selectedGame ? difficultyColor(selectedGame.difficulty) : ""}>{selectedGame?.difficulty}</Badge>
                <span className="text-xs text-muted-foreground">{selectedGame?.subject}</span>
                <span className="text-xs font-semibold text-primary">+{selectedGame?.points} SP</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic">🚧 Game coming soon — stay tuned!</p>
            <Button className="gradient-primary border-0 w-full" onClick={() => setSelectedGame(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
