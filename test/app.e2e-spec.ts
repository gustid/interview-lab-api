import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Knex } from 'knex';
import request from 'supertest';
import type { Response } from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeWithDatabase = testDatabaseUrl ? describe : describe.skip;

describeWithDatabase('InterviewLab API (e2e)', () => {
  let app: INestApplication<App>;
  let database: Knex;

  beforeAll(async () => {
    const databaseName = new URL(testDatabaseUrl as string).pathname.slice(1);

    if (!databaseName.endsWith('_test')) {
      throw new Error(
        'E2E tests require a database whose name ends in "_test"',
      );
    }

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    database = app.get(DatabaseService).knex;

    await database.migrate.latest({
      directory: 'src/database/migrations',
      loadExtensions: ['.ts'],
    });
    await clearDatabase();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (database) {
      await clearDatabase();
    }
    if (app) {
      await app.close();
    }
  });

  async function clearDatabase(): Promise<void> {
    await database('feedback').delete();
    await database('interviews').delete();
    await database('candidates').delete();
    await database('users').delete();
  }

  function bodyAs<T>(response: Response): T {
    return response.body as T;
  }

  it('registers, logs in, protects ownership, and completes the interview workflow', async () => {
    const ownerEmail = `owner-${Date.now()}@example.com`;
    const otherEmail = `other-${Date.now()}@example.com`;
    const password = 'SecurePassword123!';

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Owner User', email: ownerEmail, password })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Other User', email: otherEmail, password })
      .expect(201);

    const ownerLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: ownerEmail, password })
      .expect(201);
    const otherLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: otherEmail, password })
      .expect(201);

    const ownerToken = bodyAs<{ accessToken: string }>(ownerLogin).accessToken;
    const otherToken = bodyAs<{ accessToken: string }>(otherLogin).accessToken;

    const candidateResponse = await request(app.getHttpServer())
      .post('/api/candidates')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: `jane-${Date.now()}@example.com`,
        currentRole: 'Backend Engineer',
        targetRole: 'Senior Backend Engineer',
      })
      .expect(201);
    const candidateId = bodyAs<{ id: string }>(candidateResponse).id;

    await request(app.getHttpServer())
      .get(`/api/candidates/${candidateId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);

    const interviewResponse = await request(app.getHttpServer())
      .post('/api/interviews')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        candidateId,
        title: 'Backend mock interview',
        scheduledAt: '2026-08-01T10:00:00.000Z',
        durationMinutes: 60,
        type: 'BACKEND',
        difficulty: 'SENIOR',
        technologies: ['NestJS', 'PostgreSQL'],
      })
      .expect(201);
    const interviewId = bodyAs<{ id: string }>(interviewResponse).id;

    const feedback = {
      overallScore: 8,
      technicalScore: 8,
      communicationScore: 9,
      problemSolvingScore: 8,
      strengths: 'Clear communication and sound API design',
      improvementAreas: 'Add more detail about database indexes',
      recommendation: 'HIRE',
    };

    await request(app.getHttpServer())
      .post(`/api/interviews/${interviewId}/feedback`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(feedback)
      .expect(409);

    const completedResponse = await request(app.getHttpServer())
      .post(`/api/interviews/${interviewId}/complete`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);
    const completedInterview = bodyAs<{
      status: string;
      completedAt: string | null;
    }>(completedResponse);
    expect(completedInterview.status).toBe('COMPLETED');
    expect(completedInterview.completedAt).toBeTruthy();

    const feedbackResponse = await request(app.getHttpServer())
      .post(`/api/interviews/${interviewId}/feedback`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(feedback)
      .expect(201);
    const createdFeedback = bodyAs<{
      interviewId: string;
      recommendation: string;
    }>(feedbackResponse);
    expect(createdFeedback.interviewId).toBe(interviewId);
    expect(createdFeedback.recommendation).toBe('HIRE');
  });
});
