import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, PlayCircle, FileText, CheckCircle, Clock, Award } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  duration: string;
  lessons: number;
  enrolled: boolean;
  category: string;
  materials: Material[];
}

interface Material {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'article';
  duration?: string;
  completed: boolean;
}

const Courses = () => {
  const [courses] = useState<Course[]>([
    {
      id: "1",
      title: "Introduction to Computer Science",
      description: "Learn the fundamentals of programming and computer science concepts",
      progress: 65,
      duration: "8 weeks",
      lessons: 24,
      enrolled: true,
      category: "Computer Science",
      materials: [
        { id: "1", title: "Welcome to CS101", type: "video", duration: "15 min", completed: true },
        { id: "2", title: "Programming Basics", type: "video", duration: "30 min", completed: true },
        { id: "3", title: "Course Syllabus", type: "pdf", completed: true },
        { id: "4", title: "Variables and Data Types", type: "video", duration: "25 min", completed: false },
        { id: "5", title: "Practice Problems Set 1", type: "article", completed: false },
      ]
    },
    {
      id: "2",
      title: "Advanced Mathematics",
      description: "Explore calculus, linear algebra, and differential equations",
      progress: 30,
      duration: "10 weeks",
      lessons: 30,
      enrolled: true,
      category: "Mathematics",
      materials: [
        { id: "1", title: "Limits and Continuity", type: "video", duration: "40 min", completed: true },
        { id: "2", title: "Derivative Rules", type: "pdf", completed: true },
        { id: "3", title: "Integration Techniques", type: "video", duration: "35 min", completed: false },
        { id: "4", title: "Practice Problems", type: "article", completed: false },
      ]
    },
    {
      id: "3",
      title: "Web Development Fundamentals",
      description: "Master HTML, CSS, JavaScript and modern web frameworks",
      progress: 0,
      duration: "6 weeks",
      lessons: 18,
      enrolled: false,
      category: "Web Development",
      materials: [
        { id: "1", title: "HTML Basics", type: "video", duration: "20 min", completed: false },
        { id: "2", title: "CSS Styling", type: "video", duration: "30 min", completed: false },
        { id: "3", title: "JavaScript Introduction", type: "article", completed: false },
      ]
    },
    {
      id: "4",
      title: "Data Science with Python",
      description: "Learn data analysis, visualization, and machine learning basics",
      progress: 0,
      duration: "12 weeks",
      lessons: 36,
      enrolled: false,
      category: "Data Science",
      materials: [
        { id: "1", title: "Python Fundamentals", type: "video", duration: "45 min", completed: false },
        { id: "2", title: "NumPy and Pandas", type: "video", duration: "50 min", completed: false },
        { id: "3", title: "Data Visualization", type: "article", completed: false },
      ]
    }
  ]);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const enrolledCourses = courses.filter(c => c.enrolled);
  const availableCourses = courses.filter(c => !c.enrolled);

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'article': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Courses</h1>
            <p className="text-muted-foreground">Continue learning and earn certificates</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border-0">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Certificates Earned</p>
                <p className="text-2xl font-bold">{enrolledCourses.filter(c => c.progress === 100).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Currently Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="glass-card p-6 border-0 hover:scale-102 transition-transform cursor-pointer"
                onClick={() => setSelectedCourse(course)}>
                <div className="flex items-start justify-between mb-4">
                  <Badge className="bg-primary/20 text-primary">{course.category}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-bold">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{course.lessons} lessons</span>
                  <Button variant="outline" size="sm">Continue</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Available Courses */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => (
              <Card key={course.id} className="glass-card p-6 border-0 hover:scale-102 transition-transform">
                <Badge className="bg-secondary/20 text-secondary mb-4">{course.category}</Badge>
                
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                  <span>{course.lessons} lessons</span>
                </div>

                <Button className="w-full gradient-primary border-0">Enroll Now</Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Course Materials Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCourse(null)}>
            <Card className="glass-card p-6 border-0 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge className="bg-primary/20 text-primary mb-2">{selectedCourse.category}</Badge>
                  <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                  <p className="text-muted-foreground mt-2">{selectedCourse.description}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedCourse(null)}>×</Button>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Course Progress</span>
                  <span className="font-bold">{selectedCourse.progress}%</span>
                </div>
                <Progress value={selectedCourse.progress} />
              </div>

              <h3 className="text-lg font-bold mb-4">Course Materials</h3>
              <div className="space-y-2">
                {selectedCourse.materials.map((material) => (
                  <div key={material.id} className="glass p-4 rounded-xl flex items-center justify-between hover:scale-102 transition-transform">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${material.completed ? 'bg-primary/20' : 'bg-muted'}`}>
                        {getMaterialIcon(material.type)}
                      </div>
                      <div>
                        <p className="font-medium">{material.title}</p>
                        {material.duration && (
                          <p className="text-xs text-muted-foreground">{material.duration}</p>
                        )}
                      </div>
                    </div>
                    {material.completed ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <Button size="sm" variant="outline">Start</Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
