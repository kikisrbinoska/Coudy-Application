import axiosInstance from "./axios";

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface StudyBlock {
  day: string;
  startTime: string;
  endTime: string;
  deadlineId: number;
  courseName: string;
  deadlineTitle: string;
  allocatedMinutes: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface ScheduleResponse {
  id: number;
  weekStart: string;
  studyBlocks: StudyBlock[];
  wasFollowed: boolean | null;
  adherencePercentage: number | null;
  generatedAt: string;
}

export interface GenerateScheduleRequest {
  weekStart: string;
  availableSlots: TimeSlot[];
}

export interface WeeklyWorkload {
  weekStart: string;
  totalStudyMinutes: number;
  totalDeadlines: number;
  minutesPerCourse: Record<string, number>;
  overallPressure: string;
}

const scheduleApi = {
  generate: (data: GenerateScheduleRequest) =>
    axiosInstance.post<ScheduleResponse>("/schedules/generate", data).then((r) => r.data),

  getForWeek: (weekStart: string) =>
    axiosInstance.get<ScheduleResponse>("/schedules", { params: { weekStart } }).then((r) => r.data),

  regenerate: (data: GenerateScheduleRequest) =>
    axiosInstance.put<ScheduleResponse>("/schedules/regenerate", data).then((r) => r.data),

  getWorkload: (weekStart: string) =>
    axiosInstance.get<WeeklyWorkload>("/schedules/workload", { params: { weekStart } }).then((r) => r.data),

  getHistory: () =>
    axiosInstance.get<ScheduleResponse[]>("/schedules/history").then((r) => r.data),

  updateAdherence: (scheduleId: number, wasFollowed: boolean, adherencePercentage: number) =>
    axiosInstance
      .patch<ScheduleResponse>(`/schedules/${scheduleId}/adherence`, { wasFollowed, adherencePercentage })
      .then((r) => r.data),
};

export default scheduleApi;
