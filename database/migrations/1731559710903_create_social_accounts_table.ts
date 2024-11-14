import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'social_accounts'
  protected accountsTableName = 'accounts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().unique()
      table.uuid('account_id').references('id').inTable(this.accountsTableName).onDelete('CASCADE')
      table.string('provider_name').notNullable()

      table.string('provider_account_id').notNullable()
      table.string('name').nullable()
      table.string('avatar_url').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
