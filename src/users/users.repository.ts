import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserRecord, PublicUserRecord, UserRecord } from './user.types';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(input: CreateUserRecord): Promise<PublicUserRecord> {
    const [user] = await this.databaseService
      .knex<UserRecord>('users')
      .insert(input)
      .returning(['id', 'email', 'name', 'created_at', 'updated_at']);

    return user;
  }

  async findById(id: string): Promise<PublicUserRecord | undefined> {
    return await this.databaseService
      .knex<UserRecord>('users')
      .select('id', 'email', 'name', 'created_at', 'updated_at')
      .where({ id })
      .first();
  }

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    return await this.databaseService
      .knex<UserRecord>('users')
      .select('*')
      .where({ email })
      .first();
  }
}
