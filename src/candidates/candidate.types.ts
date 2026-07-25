export interface CandidateRecord {
  id: string;
  created_by: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string | null;
  resume_url: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCandidateRecord {
  created_by: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string | null;
  resume_url: string | null;
  notes: string | null;
}

export interface UpdateCandidateRecord {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string | null;
  notes?: string | null;
  resume_url?: string | null;
}

export interface CandidateResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string | null;
  resumeUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateListResponse {
  data: CandidateResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
