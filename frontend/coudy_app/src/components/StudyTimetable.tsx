import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface StudyBlock {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  duration: number;
}

const StudyTimetable = () => {
  const timetable: StudyBlock[] = [
    { day: "Monday", startTime: "09:00", endTime: "11:00", subject: "Mathematics", duration: 2 },
    { day: "Monday", startTime: "14:00", endTime: "16:00", subject: "Physics", duration: 2 },
    { day: "Tuesday", startTime: "10:00", endTime: "12:00", subject: "Chemistry", duration: 2 },
    { day: "Tuesday", startTime: "15:00", endTime: "17:30", subject: "Biology", duration: 2.5 },
    { day: "Wednesday", startTime: "09:00", endTime: "11:30", subject: "Mathematics", duration: 2.5 },
    { day: "Wednesday", startTime: "13:00", endTime: "15:00", subject: "History", duration: 2 },
    { day: "Thursday", startTime: "10:00", endTime: "12:30", subject: "Literature", duration: 2.5 },
    { day: "Thursday", startTime: "14:00", endTime: "16:00", subject: "Physics", duration: 2 },
    { day: "Friday", startTime: "09:00", endTime: "11:00", subject: "Chemistry", duration: 2 },
    { day: "Friday", startTime: "13:00", endTime: "16:00", subject: "Project Work", duration: 3 },
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  const getGradientClass = (index: number) => {
    const gradients = [
      "bg-gradient-to-br from-primary to-primary-glow",
      "bg-gradient-to-br from-secondary to-accent",
      "bg-gradient-to-br from-accent to-primary",
      "bg-gradient-to-br from-primary-glow to-secondary",
      "bg-gradient-to-br from-secondary to-primary",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Card className="glass-card p-6 border-0">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Weekly Study Schedule</h3>
      </div>

      <div className="space-y-4">
        {days.map((day, dayIndex) => {
          const dayBlocks = timetable.filter((block) => block.day === day);
          const totalHours = dayBlocks.reduce((sum, block) => sum + block.duration, 0);

          return (
            <div key={day} className="glass p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">{day}</h4>
                <span className="text-xs text-muted-foreground">{totalHours}h total</span>
              </div>
              <div className="space-y-2">
                {dayBlocks.map((block, blockIndex) => (
                  <div
                    key={blockIndex}
                    className={`${getGradientClass(dayIndex + blockIndex)} p-3 rounded-xl text-white shadow-md`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{block.subject}</p>
                        <p className="text-xs opacity-90">
                          {block.startTime} - {block.endTime}
                        </p>
                      </div>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded">
                        {block.duration}h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default StudyTimetable;
