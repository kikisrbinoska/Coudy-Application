import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, Trash2, RefreshCw, Loader2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import scheduleApi, { TimeSlot, StudyBlock } from "@/api/scheduleApi";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday", TUESDAY: "Tuesday", WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday", FRIDAY: "Friday", SATURDAY: "Saturday", SUNDAY: "Sunday",
};

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0") + ":00:00");

const PRIORITY_GRADIENT: Record<string, string> = {
  HIGH: "bg-gradient-to-br from-primary to-primary-glow",
  MEDIUM: "bg-gradient-to-br from-secondary to-accent",
  LOW: "bg-gradient-to-br from-accent to-primary",
};

const getMonday = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
};

const Schedule = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const weekStart = getMonday(new Date());

  const [slots, setSlots] = useState<TimeSlot[]>([
    { day: "MONDAY", startTime: "09:00:00", endTime: "12:00:00" },
    { day: "WEDNESDAY", startTime: "10:00:00", endTime: "13:00:00" },
    { day: "FRIDAY", startTime: "14:00:00", endTime: "17:00:00" },
  ]);

  const { data: schedule, isLoading } = useQuery({
    queryKey: ["schedule", weekStart],
    queryFn: () => scheduleApi.getForWeek(weekStart),
    retry: false,
    // 404 means no schedule yet — treat as null, not an error
    throwOnError: false,
  });

  const { data: workload } = useQuery({
    queryKey: ["workload", weekStart],
    queryFn: () => scheduleApi.getWorkload(weekStart),
    enabled: !!schedule,
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: () => scheduleApi.generate({ weekStart, availableSlots: slots }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule", weekStart] });
      queryClient.invalidateQueries({ queryKey: ["workload", weekStart] });
      toast({ title: "Schedule generated!" });
    },
    onError: () => toast({ title: "Failed to generate schedule", variant: "destructive" }),
  });

  const regenerateMutation = useMutation({
    mutationFn: () => scheduleApi.regenerate({ weekStart, availableSlots: slots }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule", weekStart] });
      queryClient.invalidateQueries({ queryKey: ["workload", weekStart] });
      toast({ title: "Schedule regenerated!" });
    },
    onError: () => toast({ title: "Failed to regenerate", variant: "destructive" }),
  });

  const addSlot = () =>
    setSlots([...slots, { day: "MONDAY", startTime: "09:00:00", endTime: "12:00:00" }]);

  const removeSlot = (i: number) => setSlots(slots.filter((_, idx) => idx !== i));

  const updateSlot = (i: number, field: keyof TimeSlot, value: string) =>
    setSlots(slots.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const blocksByDay = DAYS.reduce<Record<string, StudyBlock[]>>((acc, day) => {
    acc[day] = schedule?.studyBlocks.filter((b) => b.day === day) ?? [];
    return acc;
  }, {});

  const activeDays = DAYS.filter((d) => blocksByDay[d].length > 0);
  const isBusy = generateMutation.isPending || regenerateMutation.isPending;

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Study Schedule</h1>
          <p className="text-sm text-muted-foreground">Week of {weekStart}</p>
        </div>
      </div>

      {/* Workload summary */}
      {workload && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-card p-4 border-0 text-center">
            <p className="text-2xl font-bold text-primary">{(workload.totalStudyMinutes / 60).toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground">Total study</p>
          </Card>
          <Card className="glass-card p-4 border-0 text-center">
            <p className="text-2xl font-bold text-secondary">{workload.totalDeadlines}</p>
            <p className="text-xs text-muted-foreground">Deadlines</p>
          </Card>
          <Card className="glass-card p-4 border-0 text-center">
            <p className={`text-2xl font-bold ${workload.overallPressure === "HEAVY" ? "text-destructive" : workload.overallPressure === "MODERATE" ? "text-accent" : "text-primary"}`}>
              {workload.overallPressure}
            </p>
            <p className="text-xs text-muted-foreground">Workload</p>
          </Card>
        </div>
      )}

      {/* Available slots builder */}
      <Card className="glass-card p-6 border-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Available Time Slots</h3>
          </div>
          <Button size="sm" variant="outline" onClick={addSlot} className="gap-1">
            <Plus className="w-4 h-4" /> Add Slot
          </Button>
        </div>

        <div className="space-y-3">
          {slots.map((slot, i) => (
            <div key={i} className="glass p-3 rounded-xl flex flex-wrap gap-2 items-center">
              <Select value={slot.day} onValueChange={(v) => updateSlot(i, "day", v)}>
                <SelectTrigger className="w-32 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>{DAY_LABELS[d]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={slot.startTime} onValueChange={(v) => updateSlot(i, "startTime", v)}>
                <SelectTrigger className="w-28 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => <SelectItem key={h} value={h}>{h.slice(0, 5)}</SelectItem>)}
                </SelectContent>
              </Select>

              <span className="text-muted-foreground text-sm">to</span>

              <Select value={slot.endTime} onValueChange={(v) => updateSlot(i, "endTime", v)}>
                <SelectTrigger className="w-28 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => <SelectItem key={h} value={h}>{h.slice(0, 5)}</SelectItem>)}
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-destructive hover:text-destructive"
                onClick={() => removeSlot(i)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          {!schedule ? (
            <Button
              className="gradient-primary text-white flex-1"
              onClick={() => generateMutation.mutate()}
              disabled={isBusy || slots.length === 0}
            >
              {isBusy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
              Generate Schedule
            </Button>
          ) : (
            <Button
              className="gradient-primary text-white flex-1"
              onClick={() => regenerateMutation.mutate()}
              disabled={isBusy || slots.length === 0}
            >
              {isBusy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Regenerate Schedule
            </Button>
          )}
        </div>
      </Card>

      {/* Schedule display */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && schedule && (
        <Card className="glass-card p-6 border-0">
          <h3 className="font-bold mb-4">This Week's Plan</h3>
          <div className="space-y-4">
            {activeDays.map((day) => {
              const blocks = blocksByDay[day];
              const totalMinutes = blocks.reduce((s, b) => s + b.allocatedMinutes, 0);
              return (
                <div key={day} className="glass p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">{DAY_LABELS[day]}</h4>
                    <span className="text-xs text-muted-foreground">
                      {(totalMinutes / 60).toFixed(1)}h total
                    </span>
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
      )}

      {!isLoading && !schedule && (
        <Card className="glass-card p-6 border-0 text-center text-muted-foreground">
          No schedule generated yet. Add your available slots above and click Generate.
        </Card>
      )}
    </div>
  );
};

export default Schedule;
