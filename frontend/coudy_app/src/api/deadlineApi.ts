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
  dueDate: string;
  estimatedHours: number;
  priority: Priority;
  completionPercentage: number;
  status: DeadlineStatus;
  createdAt: string;
}

export interface CreateDeadlineRequest {
  course: {
    id: number;
  };
  title: string;
  description: string;
  dueDate: string;
  estimatedHours: number;
  priority: Priority;
  completionPercentage?: number;
  status?: DeadlineStatus;
}

const deadlineApi = {
  create: (data: CreateDeadlineRequest) =>
    axiosInstance.post<Deadline>("/deadline/add", data).then((r) => r.data),

  getAll: () =>
    axiosInstance.get<Deadline[]>("/deadline").then((r) => r.data),

  update: (deadline: Deadline) =>
    axiosInstance.post<Deadline>("/deadline/change", deadline).then((r) => r.data),
};

export default deadlineApi;

