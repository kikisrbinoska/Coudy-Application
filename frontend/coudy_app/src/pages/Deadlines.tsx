import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, AlertTriangle, TrendingUp, Plus, CalendarDays, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import deadlineApi, { CreateDeadlineRequest, Priority, Deadline, DeadlineStatus } from "@/api/deadlineApi";
import courseApi, { Course } from "@/api/courseApi";

const Deadlines = () => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loadingDeadlines, setLoadingDeadlines] = useState(true);
  const [updatingDeadlineId, setUpdatingDeadlineId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateDeadlineRequest>({
    course: { id: 0 },
    title: "",
    description: "",
    dueDate: "",
    estimatedHours: 0,
    priority: "MEDIUM",
    completionPercentage: 0,
    status: "NOT_STARTED",
  });

  useEffect(() => {
    loadDeadlines();
  }, []);

  useEffect(() => {
    if (dialogOpen) {
      loadCourses();
    } else {
      // Reset form when dialog closes
      setForm({
        course: { id: 0 },
        title: "",
        description: "",
        dueDate: "",
        estimatedHours: 0,
        priority: "MEDIUM",
        completionPercentage: 0,
        status: "NOT_STARTED",
      });
    }
  }, [dialogOpen]);

  const loadDeadlines = async () => {
    setLoadingDeadlines(true);
    try {
      const deadlinesData = await deadlineApi.getAll();
      setDeadlines(deadlinesData);
    } catch (error: any) {
      console.error("Failed to load deadlines:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error;
      }
      setDeadlines([]);
    } finally {
      setLoadingDeadlines(false);
    }
  };

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const coursesData = await courseApi.getAll();
      setCourses(coursesData);
    } catch (error: any) {
      console.error("Failed to load courses:", error);
      // Don't let course loading errors trigger logout
      // The axios interceptor will handle auth errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Auth error - let interceptor handle it
        throw error;
      }
      // For other errors, just show empty list
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { relative: "Overdue", absolute: date.toLocaleString() };
    } else if (diffDays === 0) {
      return { relative: "Today", absolute: date.toLocaleString() };
    } else if (diffDays === 1) {
      return { relative: "1 day", absolute: date.toLocaleString() };
    } else if (diffDays < 7) {
      return { relative: `${diffDays} days`, absolute: date.toLocaleString() };
    } else {
      const weeks = Math.floor(diffDays / 7);
      return { relative: `${weeks} week${weeks > 1 ? "s" : ""}`, absolute: date.toLocaleString() };
    }
  };

  const priorityColor = (priority: string) => {
    const priorityLower = priority.toLowerCase();
    switch (priorityLower) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-secondary text-secondary-foreground";
      case "medium":
        return "bg-accent text-accent-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.course.id || !form.dueDate) {
      return;
    }

    setCreating(true);
    try {
      // Convert datetime-local to ISO string
      const dueDateISO = new Date(form.dueDate).toISOString();
      const deadlineData = {
        ...form,
        dueDate: dueDateISO,
      };
      
      await deadlineApi.create(deadlineData);
      setDialogOpen(false);
      setForm({
        course: { id: 0 },
        title: "",
        description: "",
        dueDate: "",
        estimatedHours: 0,
        priority: "MEDIUM",
        completionPercentage: 0,
        status: "NOT_STARTED",
      });
      // Refresh deadlines list
      await loadDeadlines();
    } catch (error) {
      console.error("Failed to create deadline:", error);
      // TODO: Show error message
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (deadline: Deadline, newStatus: DeadlineStatus) => {
    setUpdatingDeadlineId(deadline.id);
    try {
      const updatedDeadline = {
        ...deadline,
        status: newStatus,
      };
      const result = await deadlineApi.update(updatedDeadline);
      // Update the deadline in the local state
      setDeadlines((prev) =>
        prev.map((d) => (d.id === deadline.id ? result : d))
      );
    } catch (error) {
      console.error("Failed to update deadline status:", error);
      // TODO: Show error message
    } finally {
      setUpdatingDeadlineId(null);
    }
  };

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
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="glass border-0"
                onClick={() => navigate("/schedule")}
              >
                <CalendarDays className="w-5 h-5 mr-2" />
                View Schedule
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary border-0">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Deadline
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Deadline</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <Label>Course *</Label>
                      {loadingCourses ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading courses...
                        </div>
                      ) : (
                        <Select
                          value={form.course.id ? form.course.id.toString() : ""}
                          onValueChange={(v) =>
                            setForm((f) => ({
                              ...f,
                              course: { id: parseInt(v) },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.length === 0 ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                No courses available
                              </div>
                            ) : (
                              courses.map((course) => (
                                <SelectItem key={course.id} value={course.id.toString()}>
                                  {course.code ? `${course.code} - ${course.name || ""}` : course.name || `Course ${course.id}`}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>Title *</Label>
                      <Input
                        placeholder="e.g. Calculus Midterm Exam"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Add details about this deadline..."
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Due Date & Time *</Label>
                        <Input
                          type="datetime-local"
                          value={form.dueDate}
                          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Estimated Hours *</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g. 8"
                          value={form.estimatedHours || ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              estimatedHours: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Priority *</Label>
                      <Select
                        value={form.priority}
                        onValueChange={(v) => setForm((f) => ({ ...f, priority: v as Priority }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Completion Percentage</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={form.completionPercentage || ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              completionPercentage: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Status</Label>
                        <Select
                          value={form.status}
                          onValueChange={(v) =>
                            setForm((f) => ({
                              ...f,
                              status: v as CreateDeadlineRequest["status"],
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="NEEDS_REVIEW">Needs Review</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="OVERDUE">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      className="w-full gradient-primary border-0"
                      onClick={handleCreate}
                      disabled={
                        creating ||
                        !form.title.trim() ||
                        !form.course.id ||
                        !form.dueDate ||
                        form.estimatedHours <= 0 ||
                        loadingCourses
                      }
                    >
                      {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Deadline
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due This Week</p>
                <p className="text-3xl font-bold mt-1">
                  {deadlines.filter((d) => {
                    const dueDate = new Date(d.dueDate);
                    const now = new Date();
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return dueDate >= now && dueDate <= weekFromNow;
                  }).length}
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
                  {deadlines.reduce((sum, d) => sum + (d.estimatedHours || 0), 0)}
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
                  {deadlines.filter((d) => d.priority?.toLowerCase() === "critical").length}
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
                  {deadlines.length > 0
                    ? Math.round(deadlines.reduce((sum, d) => sum + (d.completionPercentage || 0), 0) / deadlines.length)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-accent" />
            </div>
          </Card>
        </div>

        {/* Deadlines List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">All Deadlines</h2>
          {loadingDeadlines ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading deadlines...</span>
            </div>
          ) : deadlines.length === 0 ? (
            <Card className="glass-card p-8 border-0 text-center">
              <p className="text-muted-foreground">No deadlines yet. Create your first deadline to get started!</p>
            </Card>
          ) : (
            deadlines.map((deadline) => {
              const dateInfo = formatDate(deadline.dueDate);
              const courseName = deadline.course?.code
                ? `${deadline.course.code}${deadline.course.name ? ` - ${deadline.course.name}` : ""}`
                : deadline.course?.name || `Course ${deadline.course?.id || ""}`;
              return (
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
                            <Select
                              value={deadline.status}
                              onValueChange={(value) =>
                                handleStatusChange(deadline, value as DeadlineStatus)
                              }
                              disabled={updatingDeadlineId === deadline.id}
                            >
                              <SelectTrigger className="w-40 h-7">
                                {updatingDeadlineId === deadline.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="NEEDS_REVIEW">Needs Review</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="OVERDUE">Overdue</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <p className="text-muted-foreground">{courseName}</p>
                        </div>
                        <Badge className={priorityColor(deadline.priority)}>{dateInfo.relative}</Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {dateInfo.absolute}</span>
                          <Clock className="w-4 h-4 ml-4" />
                          <span>{deadline.estimatedHours || 0} hours estimated</span>
                        </div>

                        {deadline.description && (
                          <p className="text-sm text-muted-foreground">{deadline.description}</p>
                        )}

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{deadline.completionPercentage || 0}%</span>
                          </div>
                          <Progress value={deadline.completionPercentage || 0} className="h-3" />
                        </div>

                        {(deadline.completionPercentage || 0) < 50 && (
                          <div className="glass p-3 rounded-xl text-sm">
                            <p>
                              <strong>AI Prediction:</strong>{" "}
                              {deadline.priority?.toLowerCase() === "critical"
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Deadlines;
