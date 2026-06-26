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

  uploadPresentations: (id: number, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    return axiosInstance.post<{ course: string; topics_created: number }>(
      `/courses/${id}/upload`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    ).then((r) => r.data as { course: string; topics_created: number });
  },
};

export default courseApi;

