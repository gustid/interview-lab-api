import { Global, Module } from '@nestjs/common';
import { KNEX_CONNECTION } from './database.constants';
import { DatabaseService } from './database.service';
import { ConfigService } from '@nestjs/config';
import knex, { type Knex } from 'knex';

@Global()
@Module({
  providers: [
    {
      provide: KNEX_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Knex => {
        return knex({
          client: 'pg',
          connection: configService.getOrThrow<string>('DATABASE_URL'),
          pool: { min: 0, max: 4 },
        });
      },
    },
    DatabaseService,
  ],
  exports: [KNEX_CONNECTION, DatabaseService],
})
export class DatabaseModule {}
