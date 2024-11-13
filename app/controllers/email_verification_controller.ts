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
  public async verify({ request, view, params }: HttpContext) {
    if (!request.hasValidSignature('email_verification')) {
      return view.render('pages/verification/email_verify', {
        error: 'Your email verification link is either invalid or expired. Please try again.',
      })
    }
    const account = await Account.findBy('email', params.email)
    if (!account) {
      return view.render('pages/verification/email_verify', {
        error: 'Your email verification link is either invalid or expired. Please try again.',
      })
    }
    if (account.isActivated) {
      return view.render('pages/verification/email_verify', {
        error: 'Account is already activated!',
      })
    }
    account.isActivated = true
    await account.save()
    return view.render('pages/verification/email_verify')
  }
}
