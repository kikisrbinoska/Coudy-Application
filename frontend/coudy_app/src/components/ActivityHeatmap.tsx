import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface DayActivity {
  date: string;
  count: number;
}

const ActivityHeatmap = () => {
  // Generate mock data for the last 12 months
  const generateMockData = (): DayActivity[] => {
    const data: DayActivity[] = [];
    const today = new Date();
    
    // Generate data for 365 days (12 months)
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 8),
      });
    }
    return data;
  };

  const activityData = generateMockData();

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted/50 dark:bg-muted/30";
    if (count <= 2) return "bg-primary/20 dark:bg-primary/15";
    if (count <= 4) return "bg-primary/40 dark:bg-primary/30";
    if (count <= 6) return "bg-primary/60 dark:bg-primary/45";
    return "bg-primary/80 dark:bg-primary/60";
  };

  // Group by weeks and months
  const weeks: DayActivity[][] = [];
  const months: string[] = [];
  
  for (let i = 0; i < activityData.length; i += 7) {
    weeks.push(activityData.slice(i, i + 7));
    
    // Get month for first day of week
    if (activityData[i]) {
      const monthYear = new Date(activityData[i].date).toLocaleDateString('en-US', { month: 'short' });
      if (!months.includes(monthYear) || i === 0) {
        months.push(monthYear);
      } else {
        months.push('');
      }
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
            <div key={index} className="text-xs text-muted-foreground" style={{ minWidth: '12px' }}>
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
                  className={`w-3 h-3 rounded-sm ${getIntensityClass(day.count)} transition-all hover:scale-110 hover:ring-1 hover:ring-primary/50 dark:hover:ring-primary/30`}
                  title={`${day.date}: ${day.count} hours`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted/50 dark:bg-muted/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/20 dark:bg-primary/15" />
          <div className="w-3 h-3 rounded-sm bg-primary/40 dark:bg-primary/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/60 dark:bg-primary/45" />
          <div className="w-3 h-3 rounded-sm bg-primary/80 dark:bg-primary/60" />
        </div>
        <span>More</span>
      </div>
    </Card>
  );
};

export default ActivityHeatmap;
