import type {
  InterviewDifficulty,
  InterviewStatus,
  InterviewType,
} from './interview.constants';

export interface InterviewRecord {
  id: string;
  created_by: string;
  candidate_id: string;
  title: string;
  scheduled_at: Date;
  duration_minutes: number;
  type: InterviewType;
  status: InterviewStatus;
  difficulty: InterviewDifficulty | null;
  technologies: string[];
  notes: string | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInterviewRecord {
  created_by: string;
  candidate_id: string;
  title: string;
  scheduled_at: Date;
  duration_minutes: number;
  type: InterviewType;
  difficulty: InterviewDifficulty | null;
  technologies: string[];
  notes: string | null;
}

export interface UpdateInterviewRecord {
  candidate_id: string;
  title: string;
  scheduled_at: Date;
  duration_minutes: number;
  type: InterviewType;
  difficulty: InterviewDifficulty | null;
  technologies: string[];
  notes: string | null;
}

export interface InterviewListFilters {
  status?: InterviewStatus;
  type?: InterviewType;
  candidateId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface InterviewResponse {
  id: string;
  candidateId: string;
  title: string;
  scheduledAt: Date;
  durationMinutes: number;
  type: InterviewType;
  status: InterviewStatus;
  difficulty: InterviewDifficulty | null;
  technologies: string[];
  notes: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewListResponse {
  data: InterviewResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
