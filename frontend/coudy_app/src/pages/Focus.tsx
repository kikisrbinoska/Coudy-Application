import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Pause, Square, Plus, Trash2, Music, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const Focus = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [points, setPoints] = useState(0);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(0);
  const { toast } = useToast();

  const backgrounds = [
    "linear-gradient(135deg, hsl(330 40% 98%), hsl(210 55% 97%))",
    "linear-gradient(135deg, hsl(210 70% 90%), hsl(330 60% 92%))",
    "linear-gradient(135deg, hsl(45 80% 92%), hsl(330 70% 90%))",
    "linear-gradient(135deg, hsl(280 60% 90%), hsl(210 70% 92%))",
  ];

  const darkBackgrounds = [
    "linear-gradient(135deg, hsl(330 20% 12%), hsl(210 25% 14%))",
    "linear-gradient(135deg, hsl(210 30% 15%), hsl(330 25% 13%))",
    "linear-gradient(135deg, hsl(45 25% 14%), hsl(330 22% 12%))",
    "linear-gradient(135deg, hsl(280 25% 14%), hsl(210 28% 15%))",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleStop = () => {
    if (time > 0) {
      const earnedPoints = Math.floor(time / 60) * 10;
      setPoints(points + earnedPoints);
      toast({
        title: "Session Complete! 🎉",
        description: `You earned ${earnedPoints} points! Total: ${points + earnedPoints} points`,
      });
    }
    setIsRunning(false);
    setTime(0);
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), title: newTask, completed: false }]);
      setNewTask("");
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-8 transition-all duration-500"
      style={{ 
        background: document.documentElement.classList.contains('dark') 
          ? darkBackgrounds[backgroundImage] 
          : backgrounds[backgroundImage] 
      }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Timer Display */}
        <Card className="glass-card p-12 border-0 text-center">
          <div className="text-8xl md:text-9xl font-bold gradient-primary bg-clip-text text-transparent mb-8 tracking-tight">
            {formatTime(time)}
          </div>
          
          <div className="flex justify-center gap-4 mb-6">
            {!isRunning ? (
              <Button onClick={handleStart} size="lg" className="gradient-primary border-0 text-white text-lg px-8">
                <Play className="w-6 h-6 mr-2" />
                Start Focus
              </Button>
            ) : (
              <Button onClick={handlePause} size="lg" variant="secondary" className="text-lg px-8">
                <Pause className="w-6 h-6 mr-2" />
                Pause
              </Button>
            )}
            <Button onClick={handleStop} size="lg" variant="outline" className="text-lg px-8">
              <Square className="w-6 h-6 mr-2" />
              Stop
            </Button>
          </div>

          <div className="glass p-6 rounded-2xl inline-block">
            <p className="text-sm text-muted-foreground mb-2">Your Points</p>
            <p className="text-4xl font-bold gradient-accent bg-clip-text text-transparent">{points} SP</p>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks */}
          <Card className="glass-card p-6 border-0">
            <h3 className="text-2xl font-bold mb-4">Focus Tasks</h3>
            
            <div className="flex gap-2 mb-4">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Add a task..."
                className="flex-1"
              />
              <Button onClick={addTask} className="gradient-primary border-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 glass rounded-xl">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No tasks yet. Add one to get started!</p>
              )}
            </div>
          </Card>

          {/* Settings */}
          <Card className="glass-card p-6 border-0">
            <h3 className="text-2xl font-bold mb-4">Focus Settings</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-primary" />
                    <span className="font-medium">Cozy Music</span>
                  </div>
                  <Button
                    variant={musicEnabled ? "default" : "outline"}
                    onClick={() => {
                      setMusicEnabled(!musicEnabled);
                      toast({
                        title: musicEnabled ? "Music Disabled" : "Music Enabled",
                        description: musicEnabled ? "Focus music turned off" : "Enjoy your cozy study music",
                      });
                    }}
                  >
                    {musicEnabled ? "On" : "Off"}
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Image className="w-5 h-5 text-primary" />
                  <span className="font-medium">Background Theme</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {backgrounds.map((bg, index) => (
                    <button
                      key={index}
                      onClick={() => setBackgroundImage(index)}
                      className={`h-20 rounded-xl border-2 transition-all ${
                        backgroundImage === index 
                          ? 'border-primary scale-105 shadow-lg' 
                          : 'border-border hover:scale-102'
                      }`}
                      style={{ background: bg }}
                    />
                  ))}
                </div>
              </div>

              <div className="glass p-4 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Session Stats</p>
                <p className="text-lg font-bold">Complete sessions to earn points!</p>
                <p className="text-xs text-muted-foreground mt-2">10 points per minute studied</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Focus;
