import { ConflictException } from '@nestjs/common';
import {
  InterviewStatus,
  InterviewType,
} from '../interviews/interview.constants';
import { InterviewsService } from '../interviews/interviews.service';
import { FeedbackRepository } from './feedback.repository';
import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
  let repository: jest.Mocked<FeedbackRepository>;
  let interviewsService: jest.Mocked<InterviewsService>;
  let service: FeedbackService;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<FeedbackRepository>;
    interviewsService = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<InterviewsService>;
    service = new FeedbackService(repository, interviewsService);
  });

  it('rejects feedback for an interview that is not completed', async () => {
    interviewsService.findById.mockResolvedValue({
      id: 'interview-id',
      candidateId: 'candidate-id',
      title: 'Backend interview',
      scheduledAt: new Date('2026-08-01T10:00:00.000Z'),
      durationMinutes: 60,
      type: InterviewType.BACKEND,
      status: InterviewStatus.SCHEDULED,
      difficulty: null,
      technologies: [],
      notes: null,
      completedAt: null,
      createdAt: new Date('2026-07-26T10:00:00.000Z'),
      updatedAt: new Date('2026-07-26T10:00:00.000Z'),
    });

    await expect(
      service.create('owner-id', 'interview-id', {
        overallScore: 8,
        technicalScore: 8,
        communicationScore: 8,
        problemSolvingScore: 8,
        strengths: 'Clear reasoning',
        improvementAreas: 'More indexing detail',
        recommendation: 'HIRE',
      }),
    ).rejects.toThrow(
      new ConflictException(
        'Feedback can only be recorded for a completed interview',
      ),
    );
    expect(repository.create.mock.calls).toHaveLength(0);
  });
});
