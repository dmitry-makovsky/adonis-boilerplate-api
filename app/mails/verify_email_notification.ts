import { BaseMail } from '@adonisjs/mail'
import Account from '#models/account'
import VerificationService from '#services/verification_service'
import env from '#start/env'

export default class VerifyEmailNotification extends BaseMail {
  private account: Account
  subject = 'Verify your account'

  constructor(account: Account) {
    super()
    this.account = account
  }

  #makeUrl() {
    return `${env.get('APP_URL')}${VerificationService.makeSignedUrl(this.account.email, 'verification.email.verify')}`
  }

  prepare() {
    this.message.to(this.account.email)
    this.message.text(`
Please verify your email address by visiting ${this.#makeUrl()} and clicking the verification link.
`)
    this.message.html(`
<h1>Please verify your email address</h1>
<p>Click the link below to verify your email address.</p>
<a href="${this.#makeUrl()}">Verify email address</a>
`)
  }
}
