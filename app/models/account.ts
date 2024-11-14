import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, beforeCreate, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '../mixins/lucid.js'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import SocialAccount from './social_account.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class Account extends compose(BaseModel, AuthFinder) {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare isActivated: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @beforeCreate()
  static assignUuid(account: Account) {
    if (!account.$dirty.id) {
      account.id = randomUUID()
    }
  }

  @hasMany(() => SocialAccount)
  declare socialAccounts: HasMany<typeof SocialAccount>

  static accessTokens = DbAccessTokensProvider.forModel(Account)
}
