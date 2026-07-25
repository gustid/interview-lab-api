import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserInput, PublicUserRecord, UserRecord } from './user.types';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(input: CreateUserInput): Promise<PublicUserRecord> {
    return await this.usersRepository.create({
      name: input.name,
      email: input.email.toLowerCase(),
      password_hash: input.passwordHash,
    });
  }

  async findById(id: string): Promise<PublicUserRecord | undefined> {
    return await this.usersRepository.findById(id);
  }

  // returns the user record with the password hash included, for authentication purposes
  async findByEmail(email: string): Promise<UserRecord | undefined> {
    return await this.usersRepository.findByEmail(email.toLowerCase());
  }
}
