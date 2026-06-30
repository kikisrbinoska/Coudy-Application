import axiosInstance from "./axios";

export interface TimeSlot {
  day: string;
  start_time: string;
  end_time: string;
}

export interface StudyBlock {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  deadline_id: number;
  course_name: string;
  deadline_title: string;
  allocated_minutes: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface UpdateStudyBlockRequest {
  day?: string;
  start_time?: string;
  end_time?: string;
}

export interface ScheduleResponse {
  id: number;
  week_start: string;
  study_blocks: StudyBlock[];
  was_followed: boolean | null;
  adherence_percentage: number | null;
  generated_at: string;
}

export interface GenerateScheduleRequest {
  week_start: string;
  available_slots: TimeSlot[];
}

export interface WeeklyWorkload {
  week_start: string;
  total_study_minutes: number;
  total_deadlines: number;
  minutes_per_course: Record<string, number>;
  overall_pressure: string;
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
      .patch<ScheduleResponse>(`/schedules/${scheduleId}/adherence`, { was_followed: wasFollowed, adherence_percentage: adherencePercentage })
      .then((r) => r.data),

  updateBlock: (blockId: number, data: UpdateStudyBlockRequest) =>
    axiosInstance.patch<ScheduleResponse>(`/schedules/blocks/${blockId}`, data).then((r) => r.data),

  deleteBlock: (blockId: number) =>
    axiosInstance.delete<ScheduleResponse>(`/schedules/blocks/${blockId}`).then((r) => r.data),
};

export default scheduleApi;
