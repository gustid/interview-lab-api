import { ConflictException, NotFoundException } from '@nestjs/common';
import { CandidatesService } from '../candidates/candidates.service';
import { InterviewStatus, InterviewType } from './interview.constants';
import type { InterviewRecord } from './interview.types';
import { InterviewsRepository } from './interviews.repository';
import { InterviewsService } from './interviews.service';

describe('InterviewsService', () => {
  let repository: jest.Mocked<InterviewsRepository>;
  let service: InterviewsService;

  const interview = (status: InterviewRecord['status']): InterviewRecord => ({
    id: 'interview-id',
    created_by: 'owner-id',
    candidate_id: 'candidate-id',
    title: 'Backend interview',
    scheduled_at: new Date('2026-08-01T10:00:00.000Z'),
    duration_minutes: 60,
    type: InterviewType.BACKEND,
    status,
    difficulty: null,
    technologies: ['NestJS'],
    notes: null,
    completed_at:
      status === InterviewStatus.COMPLETED
        ? new Date('2026-08-01T11:00:00.000Z')
        : null,
    created_at: new Date('2026-07-26T10:00:00.000Z'),
    updated_at: new Date('2026-07-26T10:00:00.000Z'),
  });

  beforeEach(() => {
    repository = {
      complete: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<InterviewsRepository>;

    service = new InterviewsService(repository, {} as CandidatesService);
  });

  it('rejects completing an interview that is already completed', async () => {
    repository.complete.mockResolvedValue(undefined);
    repository.findById.mockResolvedValue(interview(InterviewStatus.COMPLETED));

    await expect(service.complete('owner-id', 'interview-id')).rejects.toThrow(
      new ConflictException('Interview is already completed'),
    );
  });

  it('rejects completing a cancelled interview', async () => {
    repository.complete.mockResolvedValue(undefined);
    repository.findById.mockResolvedValue(interview(InterviewStatus.CANCELLED));

    await expect(service.complete('owner-id', 'interview-id')).rejects.toThrow(
      new ConflictException('Cancelled interview cannot be completed'),
    );
  });

  it('returns not found when the interview does not belong to the owner', async () => {
    repository.complete.mockResolvedValue(undefined);
    repository.findById.mockResolvedValue(undefined);

    await expect(
      service.complete('different-owner', 'interview-id'),
    ).rejects.toThrow(NotFoundException);
  });
});
