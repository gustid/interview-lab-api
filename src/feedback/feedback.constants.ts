export const FeedbackRecommendation = {
  STRONG_HIRE: 'STRONG_HIRE',
  HIRE: 'HIRE',
  MIXED: 'MIXED',
  NO_HIRE: 'NO_HIRE',
  STRONG_NO_HIRE: 'STRONG_NO_HIRE',
} as const;

export type FeedbackRecommendation =
  (typeof FeedbackRecommendation)[keyof typeof FeedbackRecommendation];
