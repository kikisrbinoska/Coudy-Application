import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Plus,
  Pencil,
  Loader2,
  Brain,
  Upload,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import courseApi, { Course, CreateCourseRequest } from "@/api/courseApi";
import quizApi, { QuizQuestion, QuizResult } from "@/api/quizApi";

type View = "courses" | "topics" | "quiz" | "results";

const QUESTION_COUNT = 3;

const Courses = () => {
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role === "ROLE_ADMIN";
  const location = useLocation();
  const navigate = useNavigate();

  // course management
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateCourseRequest>({ code: "", name: "" });

  // quiz flow
  const [view, setView] = useState<View>("courses");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [topics, setTopics] = useState<string[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [uploadCourse, setUploadCourse] = useState<Course | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

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

  const handleUpload = async () => {
    if (!uploadCourse || uploadFiles.length === 0) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const res = await courseApi.uploadPresentations(uploadCourse.id, uploadFiles);
      setUploadResult(`${res.topics_created} topic(s) added to ${res.course}`);
      setUploadFiles([]);
    } catch {
      setUploadResult("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const openTopics = async (courseName: string) => {
    setSelectedCourse(courseName);
    setTopicsLoading(true);
    setView("topics");
    try {
      const t = await quizApi.getTopics(courseName);
      setTopics(t);
    } catch {
      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  };

  useEffect(() => {
    const openCourse = (location.state as { openCourse?: string } | null)?.openCourse;
    if (openCourse) {
      openTopics(openCourse);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const startQuiz = async (topic: string) => {
    setSelectedTopic(topic);
    setQuizLoading(true);
    setView("quiz");
    setCurrentIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setQuizError(null);
    try {
      const session = await quizApi.startQuiz(selectedCourse, topic, QUESTION_COUNT);
      setSessionId(session.id);
      const parsed: QuizQuestion[] = JSON.parse(session.questions_json);
      setQuestions(parsed);
    } catch (e: any) {
      setQuizError("Failed to generate questions. Please try again.");
      setQuestions([]);
    } finally {
      setQuizLoading(false);
    }
  };

  const selectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setAnswers((prev) => ({ ...prev, [currentIndex]: idx }));
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setCurrentIndex((i) => i + 1);
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const res = await quizApi.submitAnswers(sessionId, answers);
      setResult(res);
      setView("results");
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const resetToTopics = () => {
    setView("topics");
    setQuestions([]);
    setAnswers({});
    setSelectedOption(null);
    setCurrentIndex(0);
    setResult(null);
  };

  const resetToCourses = () => {
    setView("courses");
    setSelectedCourse("");
    setTopics([]);
    setQuestions([]);
    setAnswers({});
    setSelectedOption(null);
    setCurrentIndex(0);
    setResult(null);
  };

  // ── TOPICS VIEW ──────────────────────────────────────────────────────────────
  if (view === "topics") {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={resetToCourses}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold">{selectedCourse}</h1>
              <p className="text-muted-foreground">Select a topic to start a quiz</p>
            </div>
          </div>

          {topicsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : topics.length === 0 ? (
            <Card className="glass-card p-12 border-0 text-center">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No topics available for this course yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic) => (
                <Card
                  key={topic}
                  className="glass-card p-5 border-0 cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => startQuiz(topic)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-semibold">{topic}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 ml-13">
                    {QUESTION_COUNT} AI-generated questions
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── QUIZ VIEW ─────────────────────────────────────────────────────────────────
  if (view === "quiz") {
    const current = questions[currentIndex];
    const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;
    const isLast = currentIndex === questions.length - 1;

    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={resetToTopics}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{selectedTopic}</span>
                <span className="text-sm text-muted-foreground">
                  {quizLoading ? "–" : `${currentIndex + 1} / ${questions.length}`}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {quizLoading ? (
            <Card className="glass-card p-12 border-0 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Generating questions with AI...</p>
            </Card>
          ) : quizError ? (
            <Card className="glass-card p-12 border-0 text-center space-y-4">
              <XCircle className="w-12 h-12 text-red-400 mx-auto" />
              <p className="text-muted-foreground">{quizError}</p>
              <Button variant="outline" onClick={resetToTopics}>Go Back</Button>
            </Card>
          ) : !current ? (
            <Card className="glass-card p-12 border-0 text-center">
              <p className="text-muted-foreground">No questions available.</p>
            </Card>
          ) : (
            <Card className="glass-card p-6 border-0 space-y-6">
              <h2 className="text-xl font-semibold leading-snug">{current.question}</h2>

              <div className="space-y-3">
                {current.options.map((opt, idx) => {
                  const correctIdx = current.correctIndex ?? current.correct_index ?? -1;
                  let extraClass = "cursor-pointer hover:bg-primary/10";

                  if (selectedOption !== null) {
                    if (idx === correctIdx) {
                      extraClass = "border-green-500 bg-green-500/10 text-green-400";
                    } else if (idx === selectedOption) {
                      extraClass = "border-red-500 bg-red-500/10 text-red-400";
                    } else {
                      extraClass = "opacity-50 cursor-default";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${extraClass}`}
                      onClick={() => selectOption(idx)}
                      disabled={selectedOption !== null}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (() => {
                const correctIdx = current.correctIndex ?? current.correct_index ?? -1;
                const isCorrect = selectedOption === correctIdx;
                return (
                  <div className={`rounded-xl p-4 text-sm ${isCorrect ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      {isCorrect
                        ? <><CheckCircle2 className="w-4 h-4" /> Correct!</>
                        : <><XCircle className="w-4 h-4" /> Incorrect — correct answer: {String.fromCharCode(65 + correctIdx)}</>}
                    </div>
                    <p className="text-muted-foreground text-xs">{current.explanation}</p>
                  </div>
                );
              })()}

              {selectedOption !== null && (
                isLast ? (
                  <Button
                    className="w-full gradient-primary border-0"
                    onClick={submitQuiz}
                    disabled={submitting}
                  >
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit Quiz
                  </Button>
                ) : (
                  <Button className="w-full gradient-primary border-0" onClick={nextQuestion}>
                    Next Question <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )
              )}
            </Card>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS VIEW ──────────────────────────────────────────────────────────────
  if (view === "results" && result) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="glass-card p-8 border-0 text-center space-y-4">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
            <h2 className="text-3xl font-bold">Quiz Complete!</h2>
            <p className="text-muted-foreground">{selectedTopic}</p>
            <div className="text-6xl font-bold text-primary">{result.percentage}%</div>
            <p className="text-muted-foreground">
              {result.score} / {result.total_questions} correct
            </p>
            <Progress value={result.percentage} className="h-3" />
          </Card>

          <div className="space-y-3">
            {result.question_results.map((qr, idx) => (
              <Card key={idx} className="glass-card p-4 border-0">
                <div className="flex items-start gap-3">
                  {qr.correct
                    ? <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                    : <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />}
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{qr.question}</p>
                    {!qr.correct && (
                      <p className="text-xs text-muted-foreground">{qr.explanation}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={resetToTopics}>
              <RotateCcw className="w-4 h-4 mr-2" /> Try Another Topic
            </Button>
            <Button className="flex-1 gradient-primary border-0" onClick={resetToCourses}>
              Back to Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── COURSES VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Courses</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Manage courses and take quizzes" : "Select a course to take a quiz"}
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
              <Card
                key={course.id}
                className="glass-card p-6 border-0 hover:scale-[1.02] transition-transform cursor-pointer"
                onClick={() => openTopics(course.name)}
              >
                <div className="flex items-start justify-between mb-4">
                  <Badge className="bg-primary/20 text-primary">{course.code}</Badge>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        title="Upload presentations"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadCourse(course);
                          setUploadFiles([]);
                          setUploadResult(null);
                        }}
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm({ code: course.code, name: course.name });
                          setEditCourse(course);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold leading-tight">{course.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <Brain className="w-4 h-4" />
                  Take a Quiz
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Upload presentations dialog */}
        {isAdmin && (
          <Dialog open={!!uploadCourse} onOpenChange={(open) => { if (!open) { setUploadCourse(null); setUploadResult(null); setUploadFiles([]); } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Presentations — {uploadCourse?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <p className="text-sm text-muted-foreground">
                  Upload one or more PDF files. Each file becomes a quiz topic using the filename as the topic name.
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  onChange={(e) => setUploadFiles(Array.from(e.target.files ?? []))}
                />
                {uploadFiles.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {uploadFiles.map((f) => <li key={f.name}>📄 {f.name}</li>)}
                  </ul>
                )}
                {uploadResult && (
                  <p className={`text-sm font-medium ${uploadResult.includes("failed") ? "text-red-400" : "text-green-400"}`}>
                    {uploadResult}
                  </p>
                )}
                <Button
                  className="w-full gradient-primary border-0"
                  onClick={handleUpload}
                  disabled={uploading || uploadFiles.length === 0}
                >
                  {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {uploading ? "Uploading..." : `Upload ${uploadFiles.length > 0 ? `(${uploadFiles.length} file${uploadFiles.length > 1 ? "s" : ""})` : ""}`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

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
