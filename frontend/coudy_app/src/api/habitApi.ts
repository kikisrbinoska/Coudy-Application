import axiosInstance from "./axios";

export type HabitCategory = "ACADEMIC" | "WELLNESS" | "LIFE_BALANCE";
export type TargetFrequency = "DAILY" | "WEEKLY" | "CUSTOM";

export interface HabitDto {
  id: number;
  name: string;
  icon: string;
  category: HabitCategory;
  targetFrequency: TargetFrequency;
  reminderTime: string | null;
  streakCurrent: number;
  streakLongest: number;
  totalCompletions: number;
  createdAt: string;
  completedToday: boolean;
  completionRate: number;
}

export interface CreateHabitRequest {
  name: string;
  icon: string;
  category: HabitCategory;
  targetFrequency: TargetFrequency;
  reminderTime?: string | null;
}

export interface WeeklySummary {
  day: string;
  completed: number;
}

const habitApi = {
  getAll: () => axiosInstance.get<HabitDto[]>("/habits").then((r) => r.data),

  create: (data: CreateHabitRequest) =>
    axiosInstance.post<HabitDto>("/habits", data).then((r) => r.data),

  update: (id: number, data: Partial<CreateHabitRequest>) =>
    axiosInstance.put<HabitDto>(`/habits/${id}`, data).then((r) => r.data),

  delete: (id: number) => axiosInstance.delete(`/habits/${id}`),

  completeToday: (id: number) =>
    axiosInstance.post<HabitDto>(`/habits/${id}/complete`).then((r) => r.data),

  getWeeklySummary: () =>
    axiosInstance.get<WeeklySummary[]>("/habit-logs/weekly-summary").then((r) => r.data),
};

export default habitApi;
