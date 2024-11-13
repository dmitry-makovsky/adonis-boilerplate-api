import { BaseMail } from '@adonisjs/mail'
import Account from '#models/account'
import env from '#start/env'
import PasswordResetService from '#services/password_reset_service'

export default class PasswordRecoveryEmailNotification extends BaseMail {
  private account: Account
  subject = 'Password recovery'

  constructor(account: Account) {
    super()
    this.account = account
  }

  #makeUrl() {
    return `${env.get('APP_URL')}${PasswordResetService.makeSignedUrl(this.account.email)}`
  }

  prepare() {
    this.message.to(this.account.email)
    this.message.text(`
Someone requested a password reset for the account associated with this email address. 
If this was you, click the link below to reset your password. 
If you didn't request a password reset, you can ignore this email.

${this.#makeUrl()}
`)
    this.message.html(`
<h1>Password recovery</h1>
<p>Someone requested a password reset for the account associated with this email address.</p>
<p>If this was you, click the link below to reset your password.</p>
<p>If you didn't request a password reset, you can ignore this email.</p>
<p><a href="${this.#makeUrl()}">Reset password</a></p>
`)
  }
}
