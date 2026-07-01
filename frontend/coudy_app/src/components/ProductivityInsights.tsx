import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Clock, BookOpen, Target } from "lucide-react";
import focusApi, { FocusStatsDto } from "@/api/focusApi";
import habitApi, { WeeklySummary } from "@/api/habitApi";
import quizApi, { CourseStat } from "@/api/quizApi";

const SUBJECT_COLORS = [
  "hsl(330 70% 75%)",
  "hsl(210 65% 75%)",
  "hsl(45 80% 75%)",
  "hsl(160 60% 70%)",
  "hsl(270 55% 75%)",
];

const ProductivityInsights = () => {
  const [focusStats, setFocusStats] = useState<FocusStatsDto>({ total_sessions: 0, total_minutes: 0, total_points_earned: 0 });
  const [weeklyHabits, setWeeklyHabits] = useState<WeeklySummary[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStat[]>([]);

  useEffect(() => {
    focusApi.getStats().then(setFocusStats).catch(() => {});
    habitApi.getWeeklySummary().then(setWeeklyHabits).catch(() => {});
    quizApi.getCourseStats().then(setCourseStats).catch(() => {});
  }, []);

  const avgSessionHours = focusStats.total_sessions > 0
    ? Math.round((focusStats.total_minutes / focusStats.total_sessions) / 60 * 10) / 10
    : 0;

  // Map weekly habit completions to bar chart format
  const weeklyData = weeklyHabits.length > 0
    ? weeklyHabits.map((d) => ({ day: d.day.slice(0, 3), hours: d.completed }))
    : [
        { day: "Mon", hours: 0 }, { day: "Tue", hours: 0 }, { day: "Wed", hours: 0 },
        { day: "Thu", hours: 0 }, { day: "Fri", hours: 0 }, { day: "Sat", hours: 0 }, { day: "Sun", hours: 0 },
      ];

  // Subject distribution from real completed quiz session counts per course
  const totalCompletedSessions = courseStats.reduce((sum, c) => sum + c.completed_sessions, 0);
  const sortedCourseStats = [...courseStats].sort((a, b) => b.completed_sessions - a.completed_sessions);
  const subjectData = sortedCourseStats.slice(0, 5).map((c, i) => ({
    name: c.course,
    value: totalCompletedSessions > 0 ? Math.round((c.completed_sessions / totalCompletedSessions) * 100) : 0,
    color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
  }));

  const totalHours = Math.round((focusStats.total_minutes / 60) * 10) / 10;
  const bestDay = weeklyHabits.length > 0
    ? weeklyHabits.reduce((best, d) => d.completed > best.completed ? d : best, weeklyHabits[0]).day
    : "—";

  const stats = [
    { label: "Avg. Session", value: `${avgSessionHours}h`, icon: Clock, color: "text-primary" },
    { label: "Total Study Hours", value: `${totalHours}h`, icon: BookOpen, color: "text-secondary" },
    { label: "Total Sessions", value: String(focusStats.total_sessions), icon: Target, color: "text-accent" },
    { label: "Best Habit Day", value: bestDay, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="glass-card p-4 border-0">
              <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card className="glass-card p-6 border-0">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            This Week's Habit Activity
          </h3>
          {weeklyData.every((d) => d.hours === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-12">No habit activity yet this week.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem"
                  }}
                  formatter={(val) => [`${val} completed`, "Habits"]}
                />
                <Bar dataKey="hours" name="Habits" fill="hsl(330 70% 75%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Subject Distribution */}
        <Card className="glass-card p-6 border-0">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-secondary" />
            Quiz Subject Coverage
          </h3>
          {subjectData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Take quizzes to see subject distribution.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [`${val}%`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {subjectData.map((subject, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
                    <span className="text-xs text-muted-foreground truncate">{subject.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProductivityInsights;
