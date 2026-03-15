import axiosInstance from "./axios";

export interface Course {
  id: number;
  code: string;
  name: string;
}

export interface CreateCourseRequest {
  code: string;
  name: string;
}

const courseApi = {
  getAll: () =>
    axiosInstance.get<Course[]>("/courses").then((r) => r.data),

  create: (data: CreateCourseRequest) =>
    axiosInstance.post<Course>("/courses", data).then((r) => r.data),

  update: (id: number, data: CreateCourseRequest) =>
    axiosInstance.put<Course>(`/courses/${id}`, data).then((r) => r.data),
};

export default courseApi;

