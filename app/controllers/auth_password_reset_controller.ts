import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import Account from '#models/account'
import PasswordResetService from '#services/password_reset_service'
import { passwordResetValidator } from '#validators/auth'

export default class PasswordResetController {
  async sendResetLink({ request }: HttpContext) {
    const email = request.input('email')
    const account = await Account.findBy('email', email)
    if (account) {
      await PasswordResetService.sendPasswordRecoveryEmail(account)
    }
    return {
      code: 'password_reset_link_sent',
      message: 'Password reset link sent successfully',
    }
  }
  async newPasswordForm({ request, view, params }: HttpContext) {
    const isSignatureValid = request.hasValidSignature('password_reset')
    const email = params.email
    const token = await hash.make(email)
    return view.render('pages/auth/password_recovery', { isSignatureValid, email, token })
  }
  async newPasswordStore({ request, view, response, session }: HttpContext) {
    const { token, email, password } = await request.validateUsing(passwordResetValidator)
    if (!(await hash.verify(token, email))) {
      session.flashErrors({ token: 'Invalid token' })
      return response.redirect().withQs().back()
    }
    const account = await Account.findBy('email', email)
    if (!account) {
      session.flashErrors({
        common: 'Something went wrong and we may not have been able to reset your password.',
      })
      return response.redirect().withQs().back()
    }
    account.password = password
    await account.save()
    return view.render('pages/auth/password_recovery_success')
  }
}
