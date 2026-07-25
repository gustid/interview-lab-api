import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('interviews', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table
      .uuid('created_by')
      .notNullable()
      .references('id')
      .inTable('users')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table
      .uuid('candidate_id')
      .notNullable()
      .references('id')
      .inTable('candidates')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.string('title', 150).notNullable();
    table.timestamp('scheduled_at', { useTz: true }).notNullable();
    table
      .integer('duration_minutes')
      .notNullable()
      .checkBetween([0, 240], 'chk_interviews_duration');

    table
      .string('type', 50)
      .notNullable()
      .checkIn(
        [
          'CODING',
          'SYSTEM_DESIGN',
          'BEHAVIORAL',
          'FULL_STACK',
          'BACKEND',
          'FRONTEND',
        ],
        'chk_interviews_type',
      );
    table
      .string('status', 50)
      .notNullable()
      .defaultTo('SCHEDULED')
      .checkIn(
        ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
        'chk_interviews_status',
      );
    table
      .string('difficulty', 50)
      .nullable()
      .checkIn(
        ['JUNIOR', 'MID', 'SENIOR', 'EXPERT'],
        'chk_interviews_difficulty',
      );

    table
      .specificType('technologies', 'text[]')
      .notNullable()
      .defaultTo(knex.raw("'{}'::text[]"));

    table.text('notes').nullable();
    table.timestamp('completed_at', { useTz: true }).nullable();

    table.timestamps(true, true);

    table.index(
      ['created_by', 'scheduled_at'],
      'idx_interviews_owner_scheduled_at',
    );

    table.index(
      ['candidate_id', 'scheduled_at'],
      'idx_interviews_candidate_scheduled_at',
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('interviews');
}
