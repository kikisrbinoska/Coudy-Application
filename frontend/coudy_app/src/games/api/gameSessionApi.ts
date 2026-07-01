import axiosInstance, { API_ORIGIN } from "@/api/axios";

// Поправено за да одговара на реалниот GameSession ентитет што го враќа бекендот
export interface GameSessionStartDto {
  id: number; // <--- Променето од sessionId во id
  status: string;
  currentQuestionIndex: number;
}

export interface QuestionDto {
  id: number;
  text: string;
  options: string[];
  type: string;
}

export interface SubmitAnswerRequestDto {
  answer: string;
}

export interface SubmitAnswerResponseDto {
  correct: boolean;
  score: number;
  nextQuestionIndex: number;
  status: string;
  finished: boolean;
}
export interface GameSessionResultDto {
  game_id: number;
  game_name: string;
  score: number;
  max_score: number;
  end_time: string;
}
const gameSessionApi = {
  start: (gameId: number) =>
    axiosInstance
      .post<GameSessionStartDto>(`/game-sessions/start?gameId=${gameId}`)
      .then((r) => r.data),

  getQuestion: (sessionId: number) =>
    axiosInstance
      .get<QuestionDto>(`/game-sessions/${sessionId}/question`)
      .then((r) => r.data),

  answer: (sessionId: number, answer: string) =>
    axiosInstance
      .post<SubmitAnswerResponseDto>(`/game-sessions/${sessionId}/answer`, { answer })
      .then((r) => r.data),

  finish: (sessionId: number) =>
    axiosInstance
      .post<SubmitAnswerResponseDto>(`/game-sessions/${sessionId}/finish`)
      .then((r) => r.data),

  getMyResults: () =>
  axiosInstance
    .get<GameSessionResultDto[]>("/game-sessions/my-results")
    .then((r) => r.data),
};

export default gameSessionApi;