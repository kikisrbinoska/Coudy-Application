import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, CalendarDays, CheckCircle2, Clock, Loader2, Pencil, Plus, Trash2, TrendingUp, AlertTriangle } from "lucide-react";

import deadlineApi, { CreateDeadlineRequest, Deadline, DeadlineStatus, Priority } from "@/api/deadlineApi";
import courseApi, { Course } from "@/api/courseApi";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const EMPTY_FORM: CreateDeadlineRequest = {
  course: { id: 0 },
  title: "",
  description: "",
  due_date: "",
  estimated_hours: 0,
  priority: "MEDIUM",
  completion_percentage: 0,
  status: "NOT_STARTED",
};

type ApiError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
};

const parseDueDate = (val: string | number[] | undefined): Date => {
  if (!val) return new Date(NaN);
  if (Array.isArray(val)) {
    const [year, month, day, hour = 0, min = 0] = val;
    return new Date(year, month - 1, day, hour, min);
  }
  return new Date(val);
};

const Deadlines = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingDeadlineId, setDeletingDeadlineId] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loadingDeadlines, setLoadingDeadlines] = useState(true);
  const [updatingDeadlineId, setUpdatingDeadlineId] = useState<number | null>(null);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [form, setForm] = useState<CreateDeadlineRequest>(EMPTY_FORM);

  useEffect(() => {
    loadDeadlines();
  }, []);

  useEffect(() => {
    if (dialogOpen) {
      loadCourses();
    } else {
      setEditingDeadline(null);
      setForm(EMPTY_FORM);
    }
  }, [dialogOpen]);

  const loadDeadlines = async () => {
    setLoadingDeadlines(true);
    try {
      const data = await deadlineApi.getAll();
      setDeadlines(data);
    } catch (error: unknown) {
      console.error("Failed to load deadlines:", error);
      const apiError = error as ApiError;
      if (apiError.response?.status === 401 || apiError.response?.status === 403) {
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
      const data = await courseApi.getAll();
      setCourses(data);
    } catch (error: unknown) {
      console.error("Failed to load courses:", error);
      const apiError = error as ApiError;
      if (apiError.response?.status === 401 || apiError.response?.status === 403) {
        throw error;
      }
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const toDateTimeLocal = (val: string | number[] | undefined) => {
    const date = parseDueDate(val);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const openCreateDialog = () => {
    setEditingDeadline(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = async (deadline: Deadline) => {
    if (courses.length === 0) {
      try {
        await loadCourses();
      } catch {
        // Ignore auth errors here; the interceptor handles them.
      }
    }

    setEditingDeadline(deadline);
    setForm({
      course: { id: deadline.course?.id ?? 0 },
      title: deadline.title ?? "",
      description: deadline.description ?? "",
      due_date: toDateTimeLocal(deadline.due_date),
      estimated_hours: deadline.estimated_hours ?? 0,
      priority: deadline.priority ?? "MEDIUM",
      completion_percentage: deadline.completion_percentage ?? 0,
      status: deadline.status ?? "NOT_STARTED",
    });
    setDialogOpen(true);
  };

  const buildDeadlinePayload = (): Deadline => {
    if (!editingDeadline) {
      throw new Error("No deadline selected for editing");
    }

    return {
      ...editingDeadline,
      course: {
        id: form.course.id,
      },
      title: form.title,
      description: form.description,
      due_date: new Date(form.due_date).toISOString(),
      estimated_hours: form.estimated_hours,
      priority: form.priority,
      completion_percentage: form.completion_percentage ?? 0,
      status: form.status ?? "NOT_STARTED",
    };
  };

  const formatDate = (val: string | number[] | undefined) => {
    const date = parseDueDate(val);
    if (Number.isNaN(date.getTime())) return { relative: "No date", absolute: "—" };

    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { relative: "Overdue", absolute: date.toLocaleString() };
    if (diffDays === 0) return { relative: "Today", absolute: date.toLocaleString() };
    if (diffDays === 1) return { relative: "1 day", absolute: date.toLocaleString() };
    if (diffDays < 7) return { relative: `${diffDays} days`, absolute: date.toLocaleString() };

    const weeks = Math.floor(diffDays / 7);
    return { relative: `${weeks} week${weeks > 1 ? "s" : ""}`, absolute: date.toLocaleString() };
  };

  const priorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  const getDeadlineErrorMessage = (error: unknown, fallback: string) => {
    const status = (error as ApiError)?.response?.status;
    if (status === 403) return "You can only modify your own deadlines.";
    if (status === 404) return "That deadline could not be found.";
    return (error as ApiError)?.response?.data?.message || fallback;
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.course.id || !form.due_date) return;

    setCreating(true);
    try {
      await deadlineApi.create({
        ...form,
        due_date: new Date(form.due_date).toISOString(),
      });
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      await loadDeadlines();
      toast({
        title: "Deadline created",
        description: "Your new deadline is now saved.",
      });
    } catch (error: unknown) {
      console.error("Failed to create deadline:", error);
      toast({
        title: "Error",
        description: getDeadlineErrorMessage(error, "Failed to create deadline."),
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingDeadline || !form.title.trim() || !form.course.id || !form.due_date) return;

    setCreating(true);
    try {
      const result = await deadlineApi.update(buildDeadlinePayload());
      setDeadlines((prev) => prev.map((d) => (d.id === result.id ? result : d)));
      setDialogOpen(false);
      setEditingDeadline(null);
      setForm(EMPTY_FORM);
      toast({
        title: "Deadline updated",
        description: "Your changes were saved.",
      });
    } catch (error: unknown) {
      console.error("Failed to update deadline:", error);
      toast({
        title: "Error",
        description: getDeadlineErrorMessage(error, "Failed to update deadline."),
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (deadline: Deadline) => {
    if (!window.confirm(`Delete deadline "${deadline.title}"?`)) return;

    setDeletingDeadlineId(deadline.id);
    try {
      await deadlineApi.delete(deadline.id);
      setDeadlines((prev) => prev.filter((d) => d.id !== deadline.id));
      toast({
        title: "Deadline deleted",
        description: `"${deadline.title}" was removed.`,
      });
    } catch (error: unknown) {
      console.error("Failed to delete deadline:", error);
      toast({
        title: "Error",
        description: getDeadlineErrorMessage(error, "Failed to delete deadline."),
        variant: "destructive",
      });
    } finally {
      setDeletingDeadlineId(null);
    }
  };

  const handleStatusChange = async (deadline: Deadline, newStatus: DeadlineStatus) => {
    setUpdatingDeadlineId(deadline.id);
    try {
      const result = await deadlineApi.update({ ...deadline, status: newStatus });
      setDeadlines((prev) => prev.map((d) => (d.id === deadline.id ? result : d)));
      toast({
        title: "Deadline updated",
        description: `Status changed to ${newStatus.replace("_", " ").toLowerCase()}.`,
      });
    } catch (error: unknown) {
      console.error("Failed to update deadline status:", error);
      toast({
        title: "Error",
        description: getDeadlineErrorMessage(error, "Failed to update deadline status."),
        variant: "destructive",
      });
    } finally {
      setUpdatingDeadlineId(null);
    }
  };

  const handleMarkComplete = (deadline: Deadline) => handleStatusChange(deadline, "COMPLETED");
  const isEditingDeadline = editingDeadline !== null;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Deadline Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">Stay on top of your assignments</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="glass border-0" onClick={() => navigate("/schedule")}>
                <CalendarDays className="w-5 h-5 mr-2" />
                View Schedule
              </Button>
              <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) {
                    setEditingDeadline(null);
                    setForm(EMPTY_FORM);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button className="gradient-primary border-0" onClick={openCreateDialog}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Deadline
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{isEditingDeadline ? "Edit Deadline" : "Create New Deadline"}</DialogTitle>
                    <DialogDescription>
                      {isEditingDeadline
                        ? "Update the deadline details and save your changes."
                        : "Create a new deadline and set its schedule."}
                    </DialogDescription>
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
                              course: { id: parseInt(v, 10) },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.length === 0 ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">No courses available</div>
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
                          value={form.due_date}
                          onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Estimated Hours *</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g. 8"
                          value={form.estimated_hours || ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              estimated_hours: parseInt(e.target.value, 10) || 0,
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
                          value={form.completion_percentage || ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              completion_percentage: parseInt(e.target.value, 10) || 0,
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
                      onClick={isEditingDeadline ? handleUpdate : handleCreate}
                      disabled={
                        creating ||
                        !form.title.trim() ||
                        !form.course.id ||
                        !form.due_date ||
                        form.estimated_hours <= 0 ||
                        loadingCourses
                      }
                    >
                      {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {isEditingDeadline ? "Save Changes" : "Create Deadline"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due This Week</p>
                <p className="text-3xl font-bold mt-1">
                  {deadlines.filter((d) => {
                    const dueDate = parseDueDate(d.due_date);
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
                  {deadlines.reduce((sum, d) => sum + (d.estimated_hours || 0), 0)}
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
                    ? Math.round(deadlines.reduce((sum, d) => sum + (d.completion_percentage || 0), 0) / deadlines.length)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-accent" />
            </div>
          </Card>
        </div>

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
              const dateInfo = formatDate(deadline.due_date);
              const courseName = deadline.course?.code
                ? `${deadline.course.code}${deadline.course.name ? ` - ${deadline.course.name}` : ""}`
                : deadline.course?.name || `Course ${deadline.course?.id || ""}`;
              const pct = deadline.completion_percentage || 0;

              return (
                <Card key={deadline.id} className="glass-card p-6 border-0 hover:shadow-xl transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{deadline.title}</h3>
                            <Select
                              value={deadline.status}
                              onValueChange={(value) => handleStatusChange(deadline, value as DeadlineStatus)}
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
                          <span>{deadline.estimated_hours || 0} hours estimated</span>
                        </div>

                        {deadline.description && (
                          <p className="text-sm text-muted-foreground">{deadline.description}</p>
                        )}

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-3" />
                        </div>

                        {pct < 50 && (
                          <div className="glass p-3 rounded-xl text-sm">
                            <p>
                              <strong>AI Prediction:</strong>{" "}
                              {deadline.priority?.toLowerCase() === "critical"
                                ? "At risk of missing deadline. Schedule 3+ hours this week."
                                : "On track if you allocate 2 hours by tomorrow."}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <Button variant="outline" className="glass" onClick={() => openEditDialog(deadline)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="glass text-destructive hover:text-destructive"
                        onClick={() => handleDelete(deadline)}
                        disabled={deletingDeadlineId === deadline.id}
                      >
                        {deletingDeadlineId === deadline.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkComplete(deadline)}
                        disabled={updatingDeadlineId === deadline.id || deadline.status === "COMPLETED"}
                      >
                        {updatingDeadlineId === deadline.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        {deadline.status === "COMPLETED" ? "Completed" : "Mark Complete"}
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
