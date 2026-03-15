import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookOpen, Plus, Pencil, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import courseApi, { Course, CreateCourseRequest } from "@/api/courseApi";

const Courses = () => {
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role === "ROLE_ADMIN";

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateCourseRequest>({ code: "", name: "" });

  useEffect(() => {
    courseApi.getAll()
      .then(setCourses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setForm({ code: "", name: "" });
    setCreateOpen(true);
  };

  const openEdit = (course: Course) => {
    setForm({ code: course.code, name: course.name });
    setEditCourse(course);
  };

  const handleCreate = async () => {
    if (!form.code.trim() || !form.name.trim()) return;
    setSaving(true);
    try {
      const created = await courseApi.create(form);
      setCourses((prev) => [...prev, created]);
      setCreateOpen(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editCourse || !form.code.trim() || !form.name.trim()) return;
    setSaving(true);
    try {
      const updated = await courseApi.update(editCourse.id, form);
      setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditCourse(null);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Courses</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Manage available courses" : "Browse available courses"}
            </p>
          </div>

          {isAdmin && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary border-0" onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label htmlFor="code">Course Code</Label>
                    <Input
                      id="code"
                      placeholder="e.g. MATH 201"
                      value={form.code}
                      onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Course Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Advanced Mathematics"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <Button
                    className="w-full gradient-primary border-0"
                    onClick={handleCreate}
                    disabled={saving || !form.code.trim() || !form.name.trim()}
                  >
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Course
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Course List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : courses.length === 0 ? (
          <Card className="glass-card p-12 border-0 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isAdmin ? "No courses yet. Create the first one!" : "No courses available yet."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="glass-card p-6 border-0 hover:scale-102 transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <Badge className="bg-primary/20 text-primary">{course.code}</Badge>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => openEdit(course)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold leading-tight">{course.name}</h3>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog (admin only) */}
        {isAdmin && (
          <Dialog open={!!editCourse} onOpenChange={(open) => { if (!open) setEditCourse(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Course</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="edit-code">Course Code</Label>
                  <Input
                    id="edit-code"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-name">Course Name</Label>
                  <Input
                    id="edit-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <Button
                  className="w-full gradient-primary border-0"
                  onClick={handleUpdate}
                  disabled={saving || !form.code.trim() || !form.name.trim()}
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Courses;
