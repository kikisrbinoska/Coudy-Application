import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Clock, BookOpen, Target } from "lucide-react";

const ProductivityInsights = () => {
  const weeklyData = [
    { day: "Mon", hours: 5.5 },
    { day: "Tue", hours: 6.2 },
    { day: "Wed", hours: 4.8 },
    { day: "Thu", hours: 7.1 },
    { day: "Fri", hours: 6.5 },
    { day: "Sat", hours: 3.2 },
    { day: "Sun", hours: 4.0 },
  ];

  const subjectData = [
    { name: "Mathematics", value: 35, color: "hsl(330 70% 75%)" },
    { name: "Physics", value: 25, color: "hsl(210 65% 75%)" },
    { name: "Chemistry", value: 20, color: "hsl(45 80% 75%)" },
    { name: "Other", value: 20, color: "hsl(330 25% 94%)" },
  ];

  const stats = [
    { label: "Avg. Study Time", value: "5.3h", icon: Clock, color: "text-primary" },
    { label: "Total This Week", value: "37.3h", icon: BookOpen, color: "text-secondary" },
    { label: "Completion Rate", value: "87%", icon: Target, color: "text-accent" },
    { label: "Best Day", value: "Thursday", icon: TrendingUp, color: "text-primary" },
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
            Weekly Study Hours
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem"
                }} 
              />
              <Bar dataKey="hours" fill="hsl(330 70% 75%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Subject Distribution */}
        <Card className="glass-card p-6 border-0">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-secondary" />
            Subject Distribution
          </h3>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {subjectData.map((subject, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                <span className="text-xs text-muted-foreground">{subject.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductivityInsights;
