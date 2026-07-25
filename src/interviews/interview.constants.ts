export const InterviewType = {
  CODING: 'CODING',
  SYSTEM_DESIGN: 'SYSTEM_DESIGN',
  BEHAVIORAL: 'BEHAVIORAL',
  FULL_STACK: 'FULL_STACK',
  BACKEND: 'BACKEND',
  FRONTEND: 'FRONTEND',
} as const;

export type InterviewType = (typeof InterviewType)[keyof typeof InterviewType];

export const InterviewStatus = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type InterviewStatus =
  (typeof InterviewStatus)[keyof typeof InterviewStatus];

export const InterviewDifficulty = {
  JUNIOR: 'JUNIOR',
  MID: 'MID',
  SENIOR: 'SENIOR',
  EXPERT: 'EXPERT',
} as const;

export type InterviewDifficulty =
  (typeof InterviewDifficulty)[keyof typeof InterviewDifficulty];
