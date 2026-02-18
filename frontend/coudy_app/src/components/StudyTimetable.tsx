import { Card } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import scheduleApi, { StudyBlock } from "@/api/scheduleApi";

const getMonday = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
};

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday", TUESDAY: "Tuesday", WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday", FRIDAY: "Friday", SATURDAY: "Saturday", SUNDAY: "Sunday",
};

const PRIORITY_GRADIENT: Record<string, string> = {
  HIGH: "bg-gradient-to-br from-primary to-primary-glow",
  MEDIUM: "bg-gradient-to-br from-secondary to-accent",
  LOW: "bg-gradient-to-br from-accent to-primary",
};

const StudyTimetable = () => {
  const weekStart = getMonday(new Date());

  const { data: schedule, isLoading, isError } = useQuery({
    queryKey: ["schedule", weekStart],
    queryFn: () => scheduleApi.getForWeek(weekStart),
    retry: false,
  });

  if (isLoading) {
    return (
      <Card className="glass-card p-6 border-0 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </Card>
    );
  }

  if (isError || !schedule) {
    return (
      <Card className="glass-card p-6 border-0">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold">Weekly Study Schedule</h3>
        </div>
        <p className="text-muted-foreground text-sm text-center py-8">
          No schedule for this week yet.{" "}
          <a href="/schedule" className="text-primary underline">Generate one →</a>
        </p>
      </Card>
    );
  }

  const blocksByDay = DAYS.reduce<Record<string, StudyBlock[]>>((acc, day) => {
    acc[day] = schedule.studyBlocks.filter((b) => b.day === day);
    return acc;
  }, {});

  const activeDays = DAYS.filter((d) => blocksByDay[d].length > 0);

  return (
    <Card className="glass-card p-6 border-0">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Weekly Study Schedule</h3>
        <span className="ml-auto text-xs text-muted-foreground">Week of {weekStart}</span>
      </div>

      <div className="space-y-4">
        {activeDays.map((day) => {
          const blocks = blocksByDay[day];
          const totalMinutes = blocks.reduce((s, b) => s + b.allocatedMinutes, 0);
          const totalHours = (totalMinutes / 60).toFixed(1);

          return (
            <div key={day} className="glass p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">{DAY_LABELS[day]}</h4>
                <span className="text-xs text-muted-foreground">{totalHours}h total</span>
              </div>
              <div className="space-y-2">
                {blocks.map((block, i) => (
                  <div
                    key={i}
                    className={`${PRIORITY_GRADIENT[block.priority] ?? "bg-gradient-to-br from-primary to-secondary"} p-3 rounded-xl text-white shadow-md`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{block.deadlineTitle}</p>
                        <p className="text-xs opacity-75">{block.courseName}</p>
                        <p className="text-xs opacity-90 mt-1">
                          {block.startTime.slice(0, 5)} – {block.endTime.slice(0, 5)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">
                          {(block.allocatedMinutes / 60).toFixed(1)}h
                        </span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">
                          {block.priority}
                        </span>
                      </div>
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
