import axiosInstance from "./axios";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type DeadlineStatus = "NOT_STARTED" | "IN_PROGRESS" | "NEEDS_REVIEW" | "COMPLETED" | "OVERDUE";

export interface Course {
  id: number;
  code?: string;
  name?: string;
}

export interface Deadline {
  id: number;
  user?: {
    username: string;
    name?: string;
    surname?: string;
  };
  course: Course;
  title: string;
  description: string;
  due_date: string | number[];
  estimated_hours: number;
  priority: Priority;
  completion_percentage: number;
  status: DeadlineStatus;
  created_at: string | number[];
}

export interface CreateDeadlineRequest {
  course: {
    id: number;
  };
  title: string;
  description: string;
  due_date: string;
  estimated_hours: number;
  priority: Priority;
  completion_percentage?: number;
  status?: DeadlineStatus;
}

const deadlineApi = {
  create: (data: CreateDeadlineRequest) =>
    axiosInstance.post<Deadline>("/deadline/add", data).then((r) => r.data),

  getAll: () =>
    axiosInstance.get<Deadline[]>("/deadline").then((r) => r.data),

  update: (deadline: Deadline) =>
    axiosInstance.post<Deadline>("/deadline/change", deadline).then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete(`/deadline/${id}`),
};

export default deadlineApi;
