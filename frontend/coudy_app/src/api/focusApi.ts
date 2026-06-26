import axiosInstance from "./axios";

export interface FocusTaskDto {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface FocusSessionResponseDto {
  id: number;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  pointsEarned: number;
  newTotalPoints: number;
}

export interface FocusStatsDto {
  totalSessions: number;
  totalMinutes: number;
  totalPointsEarned: number;
}

export interface FocusSettingsDto {
  musicEnabled: boolean;
  backgroundTheme: string;
}

const focusApi = {
  getTasks: () =>
    axiosInstance.get<FocusTaskDto[]>("/focus/tasks").then((r) => r.data),

  createTask: (title: string) =>
    axiosInstance
      .post<FocusTaskDto>("/focus/tasks", { title })
      .then((r) => r.data),

  updateTask: (id: number, completed: boolean) =>
    axiosInstance
      .patch<FocusTaskDto>(`/focus/tasks/${id}`, { completed })
      .then((r) => r.data),

  deleteTask: (id: number) => axiosInstance.delete(`/focus/tasks/${id}`),

  createSession: (durationSeconds: number) =>
    axiosInstance
      .post<FocusSessionResponseDto>("/focus/sessions", { durationSeconds })
      .then((r) => r.data),

  getStats: () =>
    axiosInstance.get<FocusStatsDto>("/focus/sessions/stats").then((r) => r.data),

  getSettings: () =>
    axiosInstance.get<FocusSettingsDto>("/focus/settings").then((r) => r.data),

  updateSettings: (settings: FocusSettingsDto) =>
    axiosInstance
      .put<FocusSettingsDto>("/focus/settings", settings)
      .then((r) => r.data),

  getPoints: () =>
    axiosInstance.get<number>("/user/points").then((r) => r.data),
};

export default focusApi;
