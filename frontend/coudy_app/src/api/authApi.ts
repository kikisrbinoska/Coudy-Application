import axiosInstance from "./axios";

export interface CreateUserDto {
  username: string;
  password: string;
  repeat_password: string;
  name: string;
  surname: string;
  role: string;
}

export interface LoginUserDto {
  username: string;
  password: string;
}

export interface DisplayUserDto {
  username: string;
  name: string;
  surname: string;
  role: string;
  bio?: string;
  major?: string;
  year?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  surname?: string;
  bio?: string;
  major?: string;
  year?: string;
}

export interface LoginResponseDto {
  token: string;
}

export const authApi = {
  register: (data: CreateUserDto) =>
    axiosInstance.post<DisplayUserDto>("/user/register", data),

  login: (data: LoginUserDto) =>
    axiosInstance.post<LoginResponseDto>("/user/login", data),

  logout: () => axiosInstance.get("/user/logout"),

  getMe: () => axiosInstance.get<DisplayUserDto>("/user/me").then((r) => r.data),

  updateMe: (data: UpdateProfileRequest) =>
    axiosInstance.put<DisplayUserDto>("/user/me", data).then((r) => r.data),
};
