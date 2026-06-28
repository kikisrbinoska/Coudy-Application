import axiosInstance from "./axios";

export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

export interface GameDto {
  id: number;
  name: string;
  description: string;
  subject: string;
  icon: string;
  points: number;
  level: number;
  difficulty: Difficulty;
  category: string;
  active: boolean;
}

const gameApi = {
  getAll: () => axiosInstance.get<GameDto[]>("/games").then((r) => r.data),
  getById: (id: number) => axiosInstance.get<GameDto>(`/games/${id}`).then((r) => r.data),
};

export default gameApi;