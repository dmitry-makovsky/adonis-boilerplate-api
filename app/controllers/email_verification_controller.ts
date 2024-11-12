import Account from '#models/account'
import VerificationService from '#services/verification_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class EmailVerificationsController {
  public async send({ auth, response }: HttpContext) {
    const account = auth.user
    if (!account) {
      return response.badRequest({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      })
    }
    if (account.isActivated) {
      return response.badRequest({
        message: 'Account is already activated',
        code: 'ACCOUNT_ALREADY_ACTIVATED',
      })
    }

    await VerificationService.sendVerificationEmail(account)

    return response.ok({
      message: 'Email verification link has been sent',
      code: 'EMAIL_VERIFICATION_LINK_SENT',
    })
  }
  public async verify({ request, response, params }: HttpContext) {
    if (!request.hasValidSignature('email_verification')) {
      return response.badRequest({
        message: 'Invalid or expired email verification link',
        code: 'INVALID_EMAIL_VERIFICATION_LINK',
      })
    }
    const account = await Account.findBy('email', params.email)
    if (!account) {
      return response.badRequest({
        message: 'Account not found',
        code: 'ACCOUNT_NOT_FOUND',
      })
    }
    if (account.isActivated) {
      return response.badRequest({
        message: 'Account is already activated',
        code: 'ACCOUNT_ALREADY_ACTIVATED',
      })
    }

    account.isActivated = true
    await account.save()

    return response.ok({
      message: 'Account has been activated',
      code: 'ACCOUNT_ACTIVATED',
    })
  }
}
