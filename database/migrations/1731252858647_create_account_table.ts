import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accounts'

  async up() {
    this.schema
      .createTable(this.tableName, (table) => {
        table.uuid('id').notNullable().unique()
        table.string('email', 254).notNullable()
        table.string('password').notNullable()
        table.boolean('is_activated').defaultTo(false)

        table.timestamp('created_at').notNullable()
        table.timestamp('updated_at').nullable()
      })
      .raw('CREATE UNIQUE INDEX accounts_email_unique ON accounts (lower(email))')
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
