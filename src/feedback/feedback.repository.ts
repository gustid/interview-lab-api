import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type {
  CreateFeedbackRecord,
  FeedbackRecord,
  UpdateFeedbackRecord,
} from './feedback.types';

@Injectable()
export class FeedbackRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(input: CreateFeedbackRecord): Promise<FeedbackRecord> {
    const [feedback] = await this.databaseService
      .knex<FeedbackRecord>('feedback')
      .insert(input)
      .returning('*');

    return feedback;
  }

  async findByInterviewId(
    interviewId: string,
  ): Promise<FeedbackRecord | undefined> {
    return this.databaseService
      .knex<FeedbackRecord>('feedback')
      .where({ interview_id: interviewId })
      .first();
  }

  async update(
    interviewId: string,
    input: UpdateFeedbackRecord,
  ): Promise<FeedbackRecord | undefined> {
    const [feedback] = await this.databaseService
      .knex<FeedbackRecord>('feedback')
      .where({ interview_id: interviewId })
      .update({
        ...input,
        updated_at: this.databaseService.knex.fn.now(),
      })
      .returning('*');

    return feedback;
  }
}
