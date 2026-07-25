import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('candidates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table
      .uuid('created_by')
      .notNullable()
      .references('id')
      .inTable('users')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.string('first_name', 120).notNullable();
    table.string('last_name', 120).notNullable();
    table.string('email', 255).notNullable();
    table.string('role', 150).nullable();
    table.text('resume_url').nullable();
    table.text('notes').nullable();
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index(
      ['created_by', 'last_name', 'first_name'],
      'idx_candidates_user',
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('candidates');
}
