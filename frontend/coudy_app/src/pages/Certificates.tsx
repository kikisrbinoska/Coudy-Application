import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Share2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const Certificates = () => {
  const certificates = [
    {
      id: 1,
      title: "Mathematics Excellence",
      course: "Calculus II - MATH 201",
      date: "December 15, 2024",
      grade: "A+",
      hours: 85,
      icon: "🎓",
      color: "from-primary to-secondary",
    },
    {
      id: 2,
      title: "Study Consistency Champion",
      course: "30-Day Perfect Attendance",
      date: "November 30, 2024",
      grade: "100%",
      hours: 120,
      icon: "🔥",
      color: "from-secondary to-accent",
    },
    {
      id: 3,
      title: "Computer Science Mastery",
      course: "Data Structures - CS 301",
      date: "November 20, 2024",
      grade: "A",
      hours: 92,
      icon: "💻",
      color: "from-accent to-primary",
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-4">
            <Trophy className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Your Certificates
              </h1>
              <p className="text-muted-foreground mt-2">
                Celebrating your achievements and milestones
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card p-6 border-0">
            <div className="text-center">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-3xl font-bold">{certificates.length}</p>
              <p className="text-sm text-muted-foreground">Certificates Earned</p>
            </div>
          </Card>
          <Card className="glass-card p-6 border-0">
            <div className="text-center">
              <Award className="w-12 h-12 text-secondary mx-auto mb-3" />
              <p className="text-3xl font-bold">
                {certificates.reduce((sum, cert) => sum + cert.hours, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Study Hours</p>
            </div>
          </Card>
          <Card className="glass-card p-6 border-0">
            <div className="text-center">
              <div className="text-4xl mx-auto mb-3">🏆</div>
              <p className="text-3xl font-bold">Top 5%</p>
              <p className="text-sm text-muted-foreground">Global Ranking</p>
            </div>
          </Card>
        </div>

        {/* Certificates Grid */}
        <div className="space-y-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="glass-card p-0 border-0 overflow-hidden hover:shadow-2xl transition-shadow">
              <div className={`h-3 bg-gradient-to-r ${cert.color}`} />
              <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-6xl animate-float">{cert.icon}</div>
                      <div className="flex-1">
                        <Badge className="gradient-primary border-0 mb-3">
                          Certificate of Achievement
                        </Badge>
                        <h3 className="text-3xl font-bold mb-2">{cert.title}</h3>
                        <p className="text-lg text-muted-foreground mb-4">{cert.course}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Date Earned</p>
                            <p className="font-semibold">{cert.date}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Final Grade</p>
                            <p className="font-semibold text-primary">{cert.grade}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Study Hours</p>
                            <p className="font-semibold">{cert.hours} hours</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button className="gradient-primary border-0">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" className="glass">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Certificate Design Preview */}
                <div className="mt-6 glass p-8 rounded-2xl border-2 border-dashed border-primary/30">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">{cert.icon}</div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wider">
                        This certifies that
                      </p>
                      <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Emma Chen
                      </p>
                      <p className="text-sm text-muted-foreground mt-4">
                        has successfully completed
                      </p>
                      <p className="text-xl font-semibold mt-2">{cert.title}</p>
                      <p className="text-muted-foreground mt-1">{cert.course}</p>
                    </div>
                    <div className="flex justify-center gap-12 pt-6">
                      <div>
                        <div className="w-32 h-px bg-primary mb-2" />
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-sm font-medium">{cert.date}</p>
                      </div>
                      <div>
                        <div className="w-32 h-px bg-secondary mb-2" />
                        <p className="text-xs text-muted-foreground">StudySync ID</p>
                        <p className="text-sm font-medium">SS-{cert.id}2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* In Progress */}
        <Card className="glass-card p-8 border-0 text-center">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">More Certificates Coming Soon!</h3>
          <p className="text-muted-foreground">
            Complete your courses and maintain study streaks to earn more certificates
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Certificates;
