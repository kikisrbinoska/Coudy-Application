import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import focusApi from "@/api/focusApi";

interface DayActivity {
  date: string;
  minutes: number;
}

const ActivityHeatmap = () => {
  const [dailyMinutes, setDailyMinutes] = useState<Record<string, number>>({});

  useEffect(() => {
    focusApi.getDailyMinutes().then(setDailyMinutes).catch(() => {});
  }, []);

  const buildActivityData = (): DayActivity[] => {
    const data: DayActivity[] = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      data.push({ date: key, minutes: dailyMinutes[key] ?? 0 });
    }
    return data;
  };

  const activityData = buildActivityData();

  const getIntensityClass = (minutes: number) => {
    if (minutes === 0) return "bg-[#161b22] border border-[#21262d]";
    if (minutes < 30) return "bg-[#0e4429]";
    if (minutes < 60) return "bg-[#006d32]";
    if (minutes < 120) return "bg-[#26a641]";
    return "bg-[#39d353]";
  };

  const weeks: DayActivity[][] = [];
  const months: string[] = [];

  for (let i = 0; i < activityData.length; i += 7) {
    weeks.push(activityData.slice(i, i + 7));
    if (activityData[i]) {
      const monthYear = new Date(activityData[i].date).toLocaleDateString("en-US", { month: "short" });
      months.push(i === 0 || months[months.length - 1] !== monthYear ? monthYear : "");
    }
  }

  return (
    <Card className="glass-card p-6 border-0">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Study Activity</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="mb-2 flex gap-1">
          {months.map((month, index) => (
            <div key={index} className="text-xs text-muted-foreground" style={{ minWidth: "12px" }}>
              {month}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm ${getIntensityClass(day.minutes)} transition-all hover:scale-110 hover:ring-1 hover:ring-primary/50`}
                  title={`${day.date}: ${day.minutes} min studied`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-[#161b22] border border-[#21262d]" title="No activity" />
          <div className="w-3 h-3 rounded-sm bg-[#0e4429]" title="< 30 min" />
          <div className="w-3 h-3 rounded-sm bg-[#006d32]" title="30–60 min" />
          <div className="w-3 h-3 rounded-sm bg-[#26a641]" title="60–120 min" />
          <div className="w-3 h-3 rounded-sm bg-[#39d353]" title="120+ min" />
        </div>
        <span>More</span>
      </div>
    </Card>
  );
};

export default ActivityHeatmap;
