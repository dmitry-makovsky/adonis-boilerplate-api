import db from '@adonisjs/lucid/services/db'
import vine, { VineNumber, VineString } from '@vinejs/vine'
import type { FieldContext } from '@vinejs/vine/types'

type Options = {
  table: string
  column: string
  caseInsensitive?: boolean
}

async function isExists(value: unknown, options: Options, filed: FieldContext) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return
  }

  const result = await db
    .from(options.table)
    .select(options.column)
    .if(
      options?.caseInsensitive,
      (truthy) => truthy.whereILike(options.column, value),
      (falsy) => falsy.where(options.column, value)
    )
    .first()

  if (!result) {
    filed.report('Value for {{ field }} does on exist', 'isExists', filed)
  }
}

export const isExistsRule = vine.createRule(isExists)

declare module '@vinejs/vine' {
  interface VineNumber {
    isExists(options: Options): this
  }
}

declare module '@vinejs/vine' {
  interface VineString {
    isExists(options: Options): this
  }
}

VineNumber.macro('isExists', function (this: VineNumber, options: Options) {
  return this.use(isExistsRule(options))
})

VineString.macro('isExists', function (this: VineString, options: Options) {
  return this.use(isExistsRule(options))
})
