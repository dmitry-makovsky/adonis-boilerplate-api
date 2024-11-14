import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { randomUUID } from 'node:crypto'
import Account from '#models/account'

export default class SocialAccount extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare accountId: string

  @column()
  declare providerName: string

  @column()
  declare providerAccountId: string

  @column()
  declare name: string | null

  @column()
  declare avatarUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(socialAccount: SocialAccount) {
    if (!socialAccount.$dirty.id) {
      socialAccount.id = randomUUID()
    }
  }

  @belongsTo(() => Account)
  declare account: BelongsTo<typeof Account>
}
