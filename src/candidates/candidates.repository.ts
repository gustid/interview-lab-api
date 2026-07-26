import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type {
  CandidateRecord,
  CreateCandidateRecord,
  UpdateCandidateRecord,
} from './candidate.types';

@Injectable()
export class CandidatesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(input: CreateCandidateRecord): Promise<CandidateRecord> {
    const [candidate] = await this.databaseService
      .knex<CandidateRecord>('candidates')
      .insert(input)
      .returning([
        'id',
        'created_by',
        'first_name',
        'last_name',
        'email',
        'current_role',
        'target_role',
        'resume_url',
        'notes',
        'created_at',
        'updated_at',
      ]);

    return candidate;
  }

  async findAllByOwner(
    ownerId: string,
    page: number,
    pageSize: number,
  ): Promise<{
    candidates: CandidateRecord[];
    total: number;
  }> {
    const offset = (page - 1) * pageSize;

    const [candidates, countRows] = await Promise.all([
      this.databaseService
        .knex<CandidateRecord>('candidates')
        .select(
          'id',
          'created_by',
          'first_name',
          'last_name',
          'email',
          'current_role',
          'target_role',
          'resume_url',
          'notes',
          'created_at',
          'updated_at',
        )
        .where({ created_by: ownerId })
        .orderBy([
          { column: 'last_name', order: 'asc' },
          { column: 'first_name', order: 'asc' },
        ])
        .limit(pageSize)
        .offset(offset),

      this.databaseService
        .knex('candidates')
        .where({ created_by: ownerId })
        .count<{ count: string }[]>({
          count: '*',
        }),
    ]);

    return {
      candidates,
      total: Number(countRows[0]?.count ?? 0),
    };
  }

  async update(
    id: string,
    ownerId: string,
    input: UpdateCandidateRecord,
  ): Promise<CandidateRecord | undefined> {
    const [candidate] = await this.databaseService
      .knex<CandidateRecord>('candidates')
      .where({
        id,
        created_by: ownerId,
      })
      .update({
        ...input,
        updated_at: this.databaseService.knex.fn.now(),
      })
      .returning([
        'id',
        'created_by',
        'first_name',
        'last_name',
        'email',
        'current_role',
        'target_role',
        'resume_url',
        'notes',
        'created_at',
        'updated_at',
      ]);

    return candidate;
  }

  async delete(id: string, ownerId: string): Promise<number> {
    return this.databaseService
      .knex<CandidateRecord>('candidates')
      .where({
        id,
        created_by: ownerId,
      })
      .delete();
  }

  async findById(
    id: string,
    ownerId: string,
  ): Promise<CandidateRecord | undefined> {
    return this.databaseService
      .knex<CandidateRecord>('candidates')
      .select(
        'id',
        'created_by',
        'first_name',
        'last_name',
        'email',
        'current_role',
        'target_role',
        'resume_url',
        'notes',
        'created_at',
        'updated_at',
      )
      .where({
        id,
        created_by: ownerId,
      })
      .first();
  }
}
