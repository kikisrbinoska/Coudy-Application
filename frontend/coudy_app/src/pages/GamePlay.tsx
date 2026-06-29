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

const gameSessionApi = {
  // Променето од userId во username за да се совпадне со бекендот
  start: (gameId: number, username: string) =>
    axiosInstance
      .post<GameSessionStartDto>(
        `${API_ORIGIN}/game-sessions/start?gameId=${gameId}&username=${username}`
      )
      .then((r) => r.data),

  getQuestion: (sessionId: number) =>
    axiosInstance
      .get<QuestionDto>(`${API_ORIGIN}/game-sessions/${sessionId}/question`)
      .then((r) => r.data),

  answer: (sessionId: number, answer: string) =>
    axiosInstance
      .post<SubmitAnswerResponseDto>(
        `${API_ORIGIN}/game-sessions/${sessionId}/answer`,
        { answer }
      )
      .then((r) => r.data),

  finish: (sessionId: number) =>
    axiosInstance
      .post<SubmitAnswerResponseDto>(`${API_ORIGIN}/game-sessions/${sessionId}/finish`)
      .then((r) => r.data),
};

export default gameSessionApi;