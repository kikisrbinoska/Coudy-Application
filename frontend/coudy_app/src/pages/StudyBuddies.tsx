import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, MessageCircle, Video, Star, BookOpen } from "lucide-react";
import { useState } from "react";

const StudyBuddies = () => {
  const [activeTab, setActiveTab] = useState<"discover" | "mybuddies">("discover");

  const subjects = [
    { name: "Mathematics", color: "bg-primary", count: 234 },
    { name: "Computer Science", color: "bg-secondary", count: 189 },
    { name: "Physics", color: "bg-accent", count: 156 },
    { name: "Chemistry", color: "bg-destructive", count: 143 },
    { name: "Biology", color: "bg-primary", count: 198 },
    { name: "History", color: "bg-secondary", count: 87 },
    { name: "Literature", color: "bg-accent", count: 112 },
    { name: "Psychology", color: "bg-destructive", count: 165 },
  ];

  const availableBuddies = [
    {
      id: 1,
      name: "Alex Rivera",
      avatar: "👨‍🎓",
      major: "Computer Science",
      year: "Junior",
      courses: ["Data Structures", "Algorithms", "Web Dev"],
      matchScore: 95,
      studyStyle: "Discussion",
      availability: "Evenings",
      bio: "Love coding and teaching! Looking for algorithm study partners.",
    },
    {
      id: 2,
      name: "Sarah Kim",
      avatar: "👩‍🎓",
      major: "Mathematics",
      year: "Sophomore",
      courses: ["Calculus II", "Linear Algebra", "Statistics"],
      matchScore: 88,
      studyStyle: "Problem Solving",
      availability: "Afternoons",
      bio: "Math enthusiast seeking study group for challenging problems.",
    },
    {
      id: 3,
      name: "Jordan Lee",
      avatar: "🧑‍🎓",
      major: "Physics",
      year: "Senior",
      courses: ["Quantum Mechanics", "Thermodynamics"],
      matchScore: 82,
      studyStyle: "Teaching",
      availability: "Flexible",
      bio: "Physics tutor offering help and looking for mutual learning.",
    },
  ];

  const myBuddies = [
    {
      id: 1,
      name: "Alex Rivera",
      avatar: "👨‍🎓",
      course: "MATH 201",
      sessionsCompleted: 12,
      nextSession: "Today 3 PM",
      status: "online",
    },
    {
      id: 2,
      name: "Sarah Kim",
      avatar: "👩‍🎓",
      course: "CS 301",
      sessionsCompleted: 8,
      nextSession: "Tomorrow 2 PM",
      status: "offline",
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Study Buddies
              </h1>
              <p className="text-muted-foreground mt-2">Find your perfect study match</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === "discover" ? "default" : "ghost"}
                onClick={() => setActiveTab("discover")}
                className={activeTab === "discover" ? "gradient-primary border-0" : ""}
              >
                <Search className="w-4 h-4 mr-2" />
                Discover
              </Button>
              <Button
                variant={activeTab === "mybuddies" ? "default" : "ghost"}
                onClick={() => setActiveTab("mybuddies")}
                className={activeTab === "mybuddies" ? "gradient-primary border-0" : ""}
              >
                <Users className="w-4 h-4 mr-2" />
                My Buddies
              </Button>
            </div>
          </div>
        </div>

        {activeTab === "discover" && (
          <>
            {/* Subject Channels (Discord-like) */}
            <Card className="glass-card p-6 border-0">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Subject Channels
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {subjects.map((subject) => (
                  <button
                    key={subject.name}
                    className="glass p-4 rounded-2xl hover:scale-105 transition-transform text-left"
                  >
                    <div className={`w-12 h-12 rounded-xl ${subject.color} mb-3 flex items-center justify-center`}>
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1">{subject.name}</h3>
                    <p className="text-xs text-muted-foreground">{subject.count} students</p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Search */}
            <Card className="glass-card p-6 border-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search by course, major, or study style..."
                  className="pl-12 h-14 text-lg glass-card border-0"
                />
              </div>
            </Card>

            {/* Available Matches */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Top Matches for You</h2>
              {availableBuddies.map((buddy) => (
                <Card key={buddy.id} className="glass-card p-6 border-0 hover:shadow-xl transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex items-start gap-4">
                      <div className="text-6xl animate-float">{buddy.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold">{buddy.name}</h3>
                          <Badge className="gradient-primary border-0">
                            <Star className="w-3 h-3 mr-1" />
                            {buddy.matchScore}% Match
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-1">
                          {buddy.major} • {buddy.year}
                        </p>
                        <p className="text-sm mb-4">{buddy.bio}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {buddy.courses.map((course) => (
                            <Badge key={course} variant="outline" className="glass">
                              {course}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>📚 {buddy.studyStyle}</span>
                          <span>🕐 {buddy.availability}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex md:flex-col gap-2 justify-end">
                      <Button className="gradient-primary border-0">
                        <Users className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                      <Button variant="outline" className="glass">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {activeTab === "mybuddies" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Study Partners</h2>
            {myBuddies.map((buddy) => (
              <Card key={buddy.id} className="glass-card p-6 border-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="text-5xl">{buddy.avatar}</div>
                      <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ${buddy.status === 'online' ? 'bg-accent' : 'bg-muted'} border-2 border-white`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{buddy.name}</h3>
                      <p className="text-sm text-muted-foreground">{buddy.course}</p>
                      <p className="text-sm mt-1">📊 {buddy.sessionsCompleted} sessions completed</p>
                      <p className="text-sm text-primary font-medium mt-1">Next: {buddy.nextSession}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="lg" className="gradient-primary border-0">
                      <Video className="w-5 h-5 mr-2" />
                      Join Study Call
                    </Button>
                    <Button variant="outline" size="lg" className="glass">
                      <MessageCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyBuddies;
