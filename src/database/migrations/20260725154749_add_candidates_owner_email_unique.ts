import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('candidates', (table) => {
    table.unique(['created_by', 'email'], {
      indexName: 'uq_candidates_owner_email',
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('candidates', (table) => {
    table.dropUnique(['created_by', 'email'], 'uq_candidates_owner_email');
  });
}
