import axiosInstance from "./axios";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex?: number;
  correct_index?: number;
  explanation: string;
  topic: string;
}

export interface QuizSession {
  id: string;
  course: string;
  topic: string;
  questions_json: string;
  total_questions: number;
  score: number;
  completed: boolean;
  created_at: string;
}

export interface QuestionResult {
  question: string;
  selected_index: number;
  correct_index: number;
  correct: boolean;
  explanation: string;
}

export interface QuizResult {
  session_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  question_results: QuestionResult[];
}

export interface CourseStat {
  course: string;
  completed_sessions: number;
}

const quizApi = {
  getCourses: () =>
    axiosInstance.get<string[]>("/quiz/courses").then((r) => r.data),

  getCourseStats: () =>
    axiosInstance.get<CourseStat[]>("/quiz/courses/stats").then((r) => r.data),

  getTopics: (course: string) =>
    axiosInstance.get<string[]>(`/quiz/courses/${encodeURIComponent(course)}/topics`).then((r) => r.data),

  startQuiz: (course: string, topic: string, count: number) =>
    axiosInstance.post<QuizSession>("/quiz/start", { course, topic, count }).then((r) => r.data),

  submitAnswers: (sessionId: string, answers: Record<number, number>) =>
    axiosInstance.post<QuizResult>("/quiz/submit", { session_id: sessionId, answers }).then((r) => r.data),
};

export default quizApi;
