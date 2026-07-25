import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateCandidateDto } from './dto/create-candidate.dto';
import type { UpdateCandidateDto } from './dto/update-candidate.dto';
import type {
  CandidateListResponse,
  CandidateRecord,
  CandidateResponse,
} from './candidate.types';
import { CandidatesRepository } from './candidates.repository';

@Injectable()
export class CandidatesService {
  constructor(private readonly candidatesRepository: CandidatesRepository) {}

  async create(
    ownerId: string,
    input: CreateCandidateDto,
  ): Promise<CandidateResponse> {
    try {
      const candidate = await this.candidatesRepository.create({
        created_by: ownerId,
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role?.trim() || null,
        // @todo
        resume_url: null,
        notes: input.notes?.trim() || null,
      });

      return this.toResponse(candidate);
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'A candidate with this email already exists',
        );
      }

      throw error;
    }
  }

  async findAll(
    ownerId: string,
    page: number,
    pageSize: number,
  ): Promise<CandidateListResponse> {
    const result = await this.candidatesRepository.findAllByOwner(
      ownerId,
      page,
      pageSize,
    );

    return {
      data: result.candidates.map((candidate) => this.toResponse(candidate)),
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize),
      },
    };
  }

  async update(
    ownerId: string,
    id: string,
    input: UpdateCandidateDto,
  ): Promise<CandidateResponse> {
    try {
      const candidate = await this.candidatesRepository.update(id, ownerId, {
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role?.trim() || null,
        notes: input.notes?.trim() || null,
        // @todo
        resume_url: null,
      });

      if (!candidate) {
        throw new NotFoundException('Candidate was not found');
      }

      return this.toResponse(candidate);
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'A candidate with this email already exists',
        );
      }

      throw error;
    }
  }

  async delete(ownerId: string, id: string): Promise<void> {
    try {
      const deletedCount = await this.candidatesRepository.delete(id, ownerId);

      if (deletedCount === 0) {
        throw new NotFoundException('Candidate was not found');
      }
    } catch (error: unknown) {
      if (this.isForeignKeyViolation(error)) {
        throw new ConflictException(
          'Candidate cannot be deleted because they have interview history',
        );
      }

      throw error;
    }
  }

  private toResponse(candidate: CandidateRecord): CandidateResponse {
    return {
      id: candidate.id,
      firstName: candidate.first_name,
      lastName: candidate.last_name,
      email: candidate.email,
      role: candidate.role,
      resumeUrl: candidate.resume_url,
      notes: candidate.notes,
      createdAt: candidate.created_at,
      updatedAt: candidate.updated_at,
    };
  }

  private isUniqueViolation(error: unknown): error is { code: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error?.code === '23505'
    );
  }

  private isForeignKeyViolation(error: unknown): error is { code: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23503'
    );
  }
}
