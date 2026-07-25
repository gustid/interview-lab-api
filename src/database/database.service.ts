import type { Knex } from 'knex';
import { KNEX_CONNECTION } from './database.constants';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  OnApplicationShutdown,
} from '@nestjs/common';

@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@Inject(KNEX_CONNECTION) private readonly connection: Knex) {}

  get knex(): Knex {
    return this.connection;
  }

  async onModuleInit(): Promise<void> {
    await this.connection.raw('SELECT 1');
    this.logger.log('PostgreSQL connection established');
  }

  async onApplicationShutdown(): Promise<void> {
    await this.connection.destroy();
    this.logger.log(`PostgreSQL connection closed.`);
  }
}
