import { Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { DatabaseService } from '../database/database.service';
import { InterviewStatus } from './interview.constants';
import type {
  CreateInterviewRecord,
  InterviewListFilters,
  InterviewRecord,
  UpdateInterviewRecord,
} from './interview.types';

@Injectable()
export class InterviewsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(input: CreateInterviewRecord): Promise<InterviewRecord> {
    const [interview] = await this.databaseService
      .knex<InterviewRecord>('interviews')
      .insert(input)
      .returning('*');

    return interview;
  }

  async findAllByOwner(
    ownerId: string,
    filters: InterviewListFilters,
    page: number,
    pageSize: number,
  ): Promise<{
    interviews: InterviewRecord[];
    total: number;
  }> {
    const query = this.databaseService
      .knex<InterviewRecord>('interviews')
      .where({ created_by: ownerId });

    this.applyFilters(query, filters);

    const offset = (page - 1) * pageSize;
    const [interviews, countRows] = await Promise.all([
      query
        .clone()
        .select('*')
        .orderBy('scheduled_at', 'desc')
        .limit(pageSize)
        .offset(offset),
      query.clone().count<{ count: string }[]>({
        count: '*',
      }),
    ]);

    return {
      interviews,
      total: Number(countRows[0]?.count ?? 0),
    };
  }

  async findById(
    id: string,
    ownerId: string,
  ): Promise<InterviewRecord | undefined> {
    return this.databaseService
      .knex<InterviewRecord>('interviews')
      .where({
        id,
        created_by: ownerId,
      })
      .first();
  }

  async update(
    id: string,
    ownerId: string,
    input: UpdateInterviewRecord,
  ): Promise<InterviewRecord | undefined> {
    const [interview] = await this.databaseService
      .knex<InterviewRecord>('interviews')
      .where({
        id,
        created_by: ownerId,
      })
      .update({
        ...input,
        updated_at: this.databaseService.knex.fn.now(),
      })
      .returning('*');

    return interview;
  }

  async delete(id: string, ownerId: string): Promise<number> {
    return this.databaseService
      .knex<InterviewRecord>('interviews')
      .where({
        id,
        created_by: ownerId,
      })
      .delete();
  }

  async complete(
    id: string,
    ownerId: string,
  ): Promise<InterviewRecord | undefined> {
    const now = this.databaseService.knex.fn.now();
    const [interview] = await this.databaseService
      .knex<InterviewRecord>('interviews')
      .where({
        id,
        created_by: ownerId,
        status: InterviewStatus.SCHEDULED,
      })
      .update({
        status: InterviewStatus.COMPLETED,
        completed_at: now,
        updated_at: now,
      })
      .returning('*');

    return interview;
  }

  private applyFilters(
    query: Knex.QueryBuilder<InterviewRecord, InterviewRecord[]>,
    filters: InterviewListFilters,
  ): void {
    if (filters.status) {
      query.where('status', filters.status);
    }

    if (filters.type) {
      query.where('type', filters.type);
    }

    if (filters.candidateId) {
      query.where('candidate_id', filters.candidateId);
    }

    if (filters.dateFrom) {
      query.where('scheduled_at', '>=', filters.dateFrom);
    }

    if (filters.dateTo) {
      query.where('scheduled_at', '<=', filters.dateTo);
    }
  }
}
