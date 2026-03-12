import axiosInstance from "./axios";

export interface Course {
  id: number;
  code?: string;
  name?: string;
}

const courseApi = {
  getAll: () =>
    axiosInstance.get<Course[]>("/courses").then((r) => r.data),
};

export default courseApi;

