process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://interview_lab:interview_lab@localhost:5432/interview_lab_test';
process.env.JWT_SECRET = 'test-only-secret-with-at-least-32-characters';
process.env.CORS_ORIGINS = 'http://localhost:5173';
