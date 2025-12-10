import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, AlertTriangle, TrendingUp, Plus } from "lucide-react";
import { useState } from "react";

const Deadlines = () => {
  const [panicMeter] = useState(58);

  const deadlines = [
    {
      id: 1,
      title: "Calculus Midterm Exam",
      course: "MATH 201",
      dueDate: "2 days",
      dueDateTime: "Oct 28, 2:00 PM",
      hours: 8,
      priority: "critical",
      progress: 60,
      category: "Exam",
    },
    {
      id: 2,
      title: "History Research Essay",
      course: "HIST 301",
      dueDate: "4 days",
      dueDateTime: "Oct 30, 11:59 PM",
      hours: 5,
      priority: "high",
      progress: 30,
      category: "Assignment",
    },
    {
      id: 3,
      title: "Chemistry Lab Report",
      course: "CHEM 101",
      dueDate: "5 days",
      dueDateTime: "Oct 31, 5:00 PM",
      hours: 3,
      priority: "medium",
      progress: 80,
      category: "Lab",
    },
    {
      id: 4,
      title: "Computer Science Project",
      course: "CS 301",
      dueDate: "1 week",
      dueDateTime: "Nov 4, 11:59 PM",
      hours: 12,
      priority: "high",
      progress: 45,
      category: "Project",
    },
    {
      id: 5,
      title: "Physics Problem Set",
      course: "PHYS 201",
      dueDate: "1 week",
      dueDateTime: "Nov 5, 9:00 AM",
      hours: 4,
      priority: "medium",
      progress: 20,
      category: "Homework",
    },
  ];

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-secondary text-secondary-foreground";
      case "medium":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPanicStatus = (score: number) => {
    if (score < 20) return { emoji: "😌", status: "Smooth Sailing", color: "text-accent" };
    if (score < 40) return { emoji: "😐", status: "Steady Pace", color: "text-primary" };
    if (score < 60) return { emoji: "😰", status: "Getting Busy", color: "text-secondary" };
    if (score < 80) return { emoji: "😱", status: "Crunch Time", color: "text-destructive" };
    return { emoji: "🚨", status: "Emergency Mode", color: "text-destructive" };
  };

  const panicStatus = getPanicStatus(panicMeter);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Deadline Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">Stay on top of your assignments</p>
            </div>
            <Button className="gradient-primary border-0">
              <Plus className="w-5 h-5 mr-2" />
              Add Deadline
            </Button>
          </div>
        </div>

        {/* Panic Meter */}
        <Card className="glass-card p-6 border-0">
          <div className="flex items-center gap-4 mb-4">
            <AlertTriangle className="w-8 h-8 text-secondary" />
            <h2 className="text-2xl font-bold">Panic Meter</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-5xl">{panicStatus.emoji}</span>
                <div>
                  <p className={`text-2xl font-bold ${panicStatus.color}`}>
                    {panicStatus.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Current stress level: {panicMeter}/100
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{panicMeter}</p>
                <p className="text-xs text-muted-foreground">Panic Score</p>
              </div>
            </div>
            <Progress value={panicMeter} className="h-4" />
            <div className="glass p-4 rounded-2xl">
              <p className="text-sm">
                <strong>AI Recommendation:</strong> You're in the busy zone. Focus on these 3
                priorities today: Calculus Midterm, History Essay, and CS Project. Consider
                rescheduling less urgent tasks.
              </p>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due This Week</p>
                <p className="text-3xl font-bold mt-1">
                  {deadlines.filter((d) => d.dueDate.includes("day") || d.dueDate.includes("week")).length}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-primary" />
            </div>
          </Card>
          <Card className="glass-card p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-3xl font-bold mt-1">
                  {deadlines.reduce((sum, d) => sum + d.hours, 0)}
                </p>
              </div>
              <Clock className="w-10 h-10 text-secondary" />
            </div>
          </Card>
          <Card className="glass-card p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Tasks</p>
                <p className="text-3xl font-bold mt-1">
                  {deadlines.filter((d) => d.priority === "critical").length}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
          </Card>
          <Card className="glass-card p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-3xl font-bold mt-1">
                  {Math.round(deadlines.reduce((sum, d) => sum + d.progress, 0) / deadlines.length)}%
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-accent" />
            </div>
          </Card>
        </div>

        {/* Deadlines List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">All Deadlines</h2>
          {deadlines.map((deadline) => (
            <Card
              key={deadline.id}
              className="glass-card p-6 border-0 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{deadline.title}</h3>
                        <Badge variant="outline" className="glass">
                          {deadline.category}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{deadline.course}</p>
                    </div>
                    <Badge className={priorityColor(deadline.priority)}>{deadline.dueDate}</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {deadline.dueDateTime}</span>
                      <Clock className="w-4 h-4 ml-4" />
                      <span>{deadline.hours} hours estimated</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{deadline.progress}%</span>
                      </div>
                      <Progress value={deadline.progress} className="h-3" />
                    </div>

                    {deadline.progress < 50 && (
                      <div className="glass p-3 rounded-xl text-sm">
                        <p>
                          <strong>AI Prediction:</strong>{" "}
                          {deadline.priority === "critical"
                            ? "⚠️ At risk of missing deadline. Schedule 3+ hours this week."
                            : "📅 On track if you allocate 2 hours by tomorrow."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  <Button className="gradient-primary border-0">Start Working</Button>
                  <Button variant="outline" className="glass">
                    Schedule Time
                  </Button>
                  <Button variant="ghost" size="sm">
                    Mark Complete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Deadlines;
