import vine from '@vinejs/vine'

export const fullNameRule = vine.string().maxLength(255).optional()

export const registerValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .normalizeEmail({ all_lowercase: true })
      .isUnique({ table: 'accounts', column: 'email' })
      .maxLength(254),
    password: vine.string().minLength(8),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().normalizeEmail(),
    password: vine.string(),
  })
)

export const passwordResetValidator = vine.compile(
  vine.object({
    token: vine.string(),
    email: vine.string().trim().isExists({ table: 'accounts', column: 'email' }),
    password: vine.string().minLength(8),
  })
)
