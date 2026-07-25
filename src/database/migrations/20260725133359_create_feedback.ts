import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('feedback', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table
      .uuid('interview_id')
      .notNullable()
      .unique()
      .references('id')
      .inTable('interviews')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table
      .smallint('overall_score')
      .notNullable()
      .checkBetween([1, 10], 'chk_feedback_overall_score');

    table
      .smallint('technical_score')
      .notNullable()
      .checkBetween([1, 10], 'chk_feedback_technical_score');

    table
      .smallint('communication_score')
      .notNullable()
      .checkBetween([1, 10], 'chk_feedback_communication_score');

    table
      .smallint('problem_solving_score')
      .notNullable()
      .checkBetween([1, 10], 'chk_feedback_problem_solving_score');

    table.text('strengths').notNullable();
    table.text('improvement_areas').notNullable();

    table
      .string('recommendation', 50)
      .notNullable()
      .checkIn(
        ['STRONG_HIRE', 'HIRE', 'MIXED', 'NO_HIRE', 'STRONG_NO_HIRE'],
        'chk_feedback_recommendation',
      );

    table.text('additional_notes').nullable();

    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('feedback');
}
