import axios from "axios";

const BASE_URL = "http://localhost:9095";

const habitAxios = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

habitAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

habitAxios.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

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
  getAll: () => habitAxios.get<HabitDto[]>("/habits").then((r) => r.data),

  create: (data: CreateHabitRequest) =>
    habitAxios.post<HabitDto>("/habits", data).then((r) => r.data),

  update: (id: number, data: Partial<CreateHabitRequest>) =>
    habitAxios.put<HabitDto>(`/habits/${id}`, data).then((r) => r.data),

  delete: (id: number) => habitAxios.delete(`/habits/${id}`),

  completeToday: (id: number) =>
    habitAxios.post<HabitDto>(`/habits/${id}/complete`).then((r) => r.data),

  getWeeklySummary: () =>
    habitAxios.get<WeeklySummary[]>("/habit-logs/weekly-summary").then((r) => r.data),
};

export default habitApi;
