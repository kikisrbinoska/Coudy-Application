import axiosInstance from "./axios";

export interface CreateUserDto {
  username: string;
  password: string;
  repeatPassword: string;
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
};
