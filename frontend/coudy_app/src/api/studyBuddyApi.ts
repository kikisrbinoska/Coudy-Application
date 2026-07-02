import axiosInstance from "./axios";

export interface StudyBuddyCard {
  id: number | null;
  username: string;
  name?: string;
  surname?: string;
  major?: string;
  year?: string;
  courses: string[];
  match_score?: number;
  study_style?: string;
  availability?: string;
  bio?: string;
  status?: "PENDING" | "ACTIVE" | "INACTIVE";
  session_count?: number;
  unread_count?: number;
  unread_message_count?: number;
  unread_session_count?: number;
  matched_at?: string | number[];
  next_session_at?: string | number[];
  next_session_location?: string;
}

export interface BuddyConnectionRequest {
  id: number;
  sender_username: string;
  sender_name?: string;
  sender_surname?: string;
  receiver_username: string;
  receiver_name?: string;
  receiver_surname?: string;
  message?: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
  created_at: string | number[];
  responded_at?: string | number[];
  read_at?: string | number[];
}

export interface BuddyNotification {
  type: "CONNECTION_REQUEST" | "MESSAGE" | "SESSION";
  request_id?: number;
  buddy_id?: number;
  session_id?: number;
  sender_username?: string;
  sender_name?: string;
  sender_surname?: string;
  title?: string;
  preview?: string;
  created_at: string | number[];
}

export interface BuddySession {
  id: number;
  buddy_id: number;
  scheduled_time: string | number[];
  location?: string;
  duration_minutes?: number;
  attended_user1?: boolean;
  attended_user2?: boolean;
  rating_user1?: number;
  rating_user2?: number;
  notes?: string;
  status: "REQUESTED" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  created_by_username?: string;
}

export interface BuddyMessage {
  id: number;
  buddy_id: number;
  sender_username?: string;
  sender_name?: string;
  sender_surname?: string;
  content: string;
  sent_at: string | number[];
}

export interface CreateBuddySessionRequest {
  scheduled_time?: string;
  location?: string;
  duration_minutes?: number;
  notes?: string;
}

export interface SendBuddyMessageRequest {
  content: string;
}

const studyBuddyApi = {
  discover: () =>
    axiosInstance.get<StudyBuddyCard[]>("/study-buddies/discover").then((r) => r.data),

  mine: () =>
    axiosInstance.get<StudyBuddyCard[]>("/study-buddies/mine").then((r) => r.data),

  incomingRequests: () =>
    axiosInstance.get<BuddyConnectionRequest[]>("/study-buddies/requests/incoming").then((r) => r.data),

  outgoingRequests: () =>
    axiosInstance.get<BuddyConnectionRequest[]>("/study-buddies/requests/outgoing").then((r) => r.data),

  notifications: () =>
    axiosInstance.get<BuddyNotification[]>("/study-buddies/notifications").then((r) => r.data),

  notificationCount: () =>
    axiosInstance.get<number>("/study-buddies/notifications/count").then((r) => r.data),

  markNotificationsRead: () =>
    axiosInstance.post<void>("/study-buddies/notifications/read").then((r) => r.data),

  connect: (username: string) =>
    axiosInstance.post<BuddyConnectionRequest>(`/study-buddies/connect/${username}`).then((r) => r.data),

  acceptRequest: (requestId: number) =>
    axiosInstance.post<BuddyConnectionRequest>(`/study-buddies/requests/${requestId}/accept`).then((r) => r.data),

  declineRequest: (requestId: number) =>
    axiosInstance.post<BuddyConnectionRequest>(`/study-buddies/requests/${requestId}/decline`).then((r) => r.data),

  cancelRequest: (requestId: number) =>
    axiosInstance.post<BuddyConnectionRequest>(`/study-buddies/requests/${requestId}/cancel`).then((r) => r.data),

  removeBuddy: (buddyId: number) =>
    axiosInstance.delete<void>(`/study-buddies/${buddyId}`).then((r) => r.data),

  sessions: (buddyId: number) =>
    axiosInstance.get<BuddySession[]>(`/study-buddies/${buddyId}/sessions`).then((r) => r.data),

  createSession: (buddyId: number, data: CreateBuddySessionRequest) =>
    axiosInstance.post<BuddySession>(`/study-buddies/${buddyId}/sessions`, data).then((r) => r.data),

  acceptSession: (sessionId: number) =>
    axiosInstance.post<BuddySession>(`/study-buddies/sessions/${sessionId}/accept`).then((r) => r.data),

  declineSession: (sessionId: number) =>
    axiosInstance.post<BuddySession>(`/study-buddies/sessions/${sessionId}/decline`).then((r) => r.data),

  messages: (buddyId: number) =>
    axiosInstance.get<BuddyMessage[]>(`/study-buddies/${buddyId}/messages`).then((r) => r.data),

  sendMessage: (buddyId: number, data: SendBuddyMessageRequest) =>
    axiosInstance.post<BuddyMessage>(`/study-buddies/${buddyId}/messages`, data).then((r) => r.data),
};

export default studyBuddyApi;
