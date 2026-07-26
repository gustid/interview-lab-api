import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('candidates', (table) => {
    table.renameColumn('role', 'current_role');
    table.string('target_role', 150).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('candidates', (table) => {
    table.dropColumn('target_role');
    table.renameColumn('current_role', 'role');
  });
}
