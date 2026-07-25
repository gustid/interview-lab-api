import type { FeedbackRecommendation } from './feedback.constants';

export interface FeedbackRecord {
  id: string;
  interview_id: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  strengths: string;
  improvement_areas: string;
  recommendation: FeedbackRecommendation;
  additional_notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateFeedbackRecord {
  interview_id: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  strengths: string;
  improvement_areas: string;
  recommendation: FeedbackRecommendation;
  additional_notes: string | null;
}

export type UpdateFeedbackRecord = Omit<CreateFeedbackRecord, 'interview_id'>;

export interface FeedbackResponse {
  id: string;
  interviewId: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  strengths: string;
  improvementAreas: string;
  recommendation: FeedbackRecommendation;
  additionalNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
