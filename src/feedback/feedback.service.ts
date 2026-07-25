import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InterviewStatus } from '../interviews/interview.constants';
import { InterviewsService } from '../interviews/interviews.service';
import type { CreateFeedbackDto } from './dto/create-feedback.dto';
import type { UpdateFeedbackDto } from './dto/update-feedback.dto';
import type {
  FeedbackRecord,
  FeedbackResponse,
  UpdateFeedbackRecord,
} from './feedback.types';
import { FeedbackRepository } from './feedback.repository';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackRepository: FeedbackRepository,
    private readonly interviewsService: InterviewsService,
  ) {}

  async create(
    ownerId: string,
    interviewId: string,
    input: CreateFeedbackDto,
  ): Promise<FeedbackResponse> {
    await this.ensureCompletedInterview(ownerId, interviewId);

    try {
      const feedback = await this.feedbackRepository.create({
        interview_id: interviewId,
        ...this.toRecord(input),
      });

      return this.toResponse(feedback);
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'Feedback already exists for this interview',
        );
      }

      throw error;
    }
  }

  async findByInterviewId(
    ownerId: string,
    interviewId: string,
  ): Promise<FeedbackResponse> {
    await this.interviewsService.findById(ownerId, interviewId);

    const feedback =
      await this.feedbackRepository.findByInterviewId(interviewId);

    if (!feedback) {
      throw new NotFoundException('Feedback was not found');
    }

    return this.toResponse(feedback);
  }

  async update(
    ownerId: string,
    interviewId: string,
    input: UpdateFeedbackDto,
  ): Promise<FeedbackResponse> {
    await this.ensureCompletedInterview(ownerId, interviewId);

    const feedback = await this.feedbackRepository.update(
      interviewId,
      this.toRecord(input),
    );

    if (!feedback) {
      throw new NotFoundException('Feedback was not found');
    }

    return this.toResponse(feedback);
  }

  private async ensureCompletedInterview(
    ownerId: string,
    interviewId: string,
  ): Promise<void> {
    const interview = await this.interviewsService.findById(
      ownerId,
      interviewId,
    );

    if (interview.status !== InterviewStatus.COMPLETED) {
      throw new ConflictException(
        'Feedback can only be recorded for a completed interview',
      );
    }
  }

  private toRecord(
    input: CreateFeedbackDto | UpdateFeedbackDto,
  ): UpdateFeedbackRecord {
    return {
      overall_score: input.overallScore,
      technical_score: input.technicalScore,
      communication_score: input.communicationScore,
      problem_solving_score: input.problemSolvingScore,
      strengths: input.strengths.trim(),
      improvement_areas: input.improvementAreas.trim(),
      recommendation: input.recommendation,
      additional_notes: input.additionalNotes?.trim() || null,
    };
  }

  private toResponse(feedback: FeedbackRecord): FeedbackResponse {
    return {
      id: feedback.id,
      interviewId: feedback.interview_id,
      overallScore: feedback.overall_score,
      technicalScore: feedback.technical_score,
      communicationScore: feedback.communication_score,
      problemSolvingScore: feedback.problem_solving_score,
      strengths: feedback.strengths,
      improvementAreas: feedback.improvement_areas,
      recommendation: feedback.recommendation,
      additionalNotes: feedback.additional_notes,
      createdAt: feedback.created_at,
      updatedAt: feedback.updated_at,
    };
  }

  private isUniqueViolation(error: unknown): error is { code: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }
}
