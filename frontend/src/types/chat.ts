export interface ChatInsight {
  title: string;
  value: string | null;
  description: string;
}


export interface StructuredChatAnswer {
  headline: string;
  summary: string;
  insights: ChatInsight[];
  takeaway: string | null;
}


export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}


export interface AIChatRequest {
  question: string;
  history: ChatHistoryMessage[];
}


export interface AIChatResponse {
  dataset_id: number;
  dataset_name: string;
  question: string;
  answer: StructuredChatAnswer;
}


export interface UserChatMessage {
  id: string;
  role: "user";
  content: string;
}


export interface AssistantChatMessage {
  id: string;
  role: "assistant";
  content: StructuredChatAnswer;
}


export type ChatMessage =
  | UserChatMessage
  | AssistantChatMessage;