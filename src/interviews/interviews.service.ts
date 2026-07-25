import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CandidatesService } from '../candidates/candidates.service';
import type { CreateInterviewDto } from './dto/create-interview.dto';
import type { ListInterviewsQueryDto } from './dto/list-interviews-query.dto';
import type { UpdateInterviewDto } from './dto/update-interview.dto';
import type {
  CreateInterviewRecord,
  InterviewListResponse,
  InterviewRecord,
  InterviewResponse,
  UpdateInterviewRecord,
} from './interview.types';
import { InterviewStatus } from './interview.constants';
import { InterviewsRepository } from './interviews.repository';

@Injectable()
export class InterviewsService {
  constructor(
    private readonly interviewsRepository: InterviewsRepository,
    private readonly candidatesService: CandidatesService,
  ) {}

  async create(
    ownerId: string,
    input: CreateInterviewDto,
  ): Promise<InterviewResponse> {
    await this.ensureCandidateOwnership(ownerId, input.candidateId);

    const interview = await this.interviewsRepository.create(
      this.toCreateRecord(ownerId, input),
    );

    return this.toResponse(interview);
  }

  async findAll(
    ownerId: string,
    query: ListInterviewsQueryDto,
  ): Promise<InterviewListResponse> {
    const result = await this.interviewsRepository.findAllByOwner(
      ownerId,
      {
        status: query.status,
        type: query.type,
        candidateId: query.candidateId,
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      },
      query.page,
      query.pageSize,
    );

    return {
      data: result.interviews.map((interview) => this.toResponse(interview)),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / query.pageSize),
      },
    };
  }

  async findById(ownerId: string, id: string): Promise<InterviewResponse> {
    const interview = await this.interviewsRepository.findById(id, ownerId);

    if (!interview) {
      throw new NotFoundException('Interview was not found');
    }

    return this.toResponse(interview);
  }

  async update(
    ownerId: string,
    id: string,
    input: UpdateInterviewDto,
  ): Promise<InterviewResponse> {
    await this.ensureCandidateOwnership(ownerId, input.candidateId);

    const interview = await this.interviewsRepository.update(
      id,
      ownerId,
      this.toUpdateRecord(input),
    );

    if (!interview) {
      throw new NotFoundException('Interview was not found');
    }

    return this.toResponse(interview);
  }

  async delete(ownerId: string, id: string): Promise<void> {
    const deletedCount = await this.interviewsRepository.delete(id, ownerId);

    if (deletedCount === 0) {
      throw new NotFoundException('Interview was not found');
    }
  }

  async complete(ownerId: string, id: string): Promise<InterviewResponse> {
    const completedInterview = await this.interviewsRepository.complete(
      id,
      ownerId,
    );

    if (completedInterview) {
      return this.toResponse(completedInterview);
    }

    const interview = await this.interviewsRepository.findById(id, ownerId);

    if (!interview) {
      throw new NotFoundException('Interview was not found');
    }

    if (interview.status === InterviewStatus.COMPLETED) {
      throw new ConflictException('Interview is already completed');
    }

    if (interview.status === InterviewStatus.CANCELLED) {
      throw new ConflictException('Cancelled interview cannot be completed');
    }

    throw new ConflictException('Interview cannot be completed');
  }

  private async ensureCandidateOwnership(
    ownerId: string,
    candidateId: string,
  ): Promise<void> {
    await this.candidatesService.findById(ownerId, candidateId);
  }

  private toCreateRecord(
    ownerId: string,
    input: CreateInterviewDto,
  ): CreateInterviewRecord {
    return {
      created_by: ownerId,
      candidate_id: input.candidateId,
      title: input.title.trim(),
      scheduled_at: new Date(input.scheduledAt),
      duration_minutes: input.durationMinutes,
      type: input.type,
      difficulty: input.difficulty ?? null,
      technologies: this.normalizeTechnologies(input.technologies),
      notes: input.notes?.trim() || null,
    };
  }

  private toUpdateRecord(input: UpdateInterviewDto): UpdateInterviewRecord {
    return {
      candidate_id: input.candidateId,
      title: input.title.trim(),
      scheduled_at: new Date(input.scheduledAt),
      duration_minutes: input.durationMinutes,
      type: input.type,
      difficulty: input.difficulty ?? null,
      technologies: this.normalizeTechnologies(input.technologies),
      notes: input.notes?.trim() || null,
    };
  }

  private normalizeTechnologies(technologies?: string[]): string[] {
    return [
      ...new Set(
        (technologies ?? [])
          .map((technology) => technology.trim())
          .filter(Boolean),
      ),
    ];
  }

  private toResponse(interview: InterviewRecord): InterviewResponse {
    return {
      id: interview.id,
      candidateId: interview.candidate_id,
      title: interview.title,
      scheduledAt: interview.scheduled_at,
      durationMinutes: interview.duration_minutes,
      type: interview.type,
      status: interview.status,
      difficulty: interview.difficulty,
      technologies: interview.technologies,
      notes: interview.notes,
      completedAt: interview.completed_at,
      createdAt: interview.created_at,
      updatedAt: interview.updated_at,
    };
  }
}
