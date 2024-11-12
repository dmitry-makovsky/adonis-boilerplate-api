import VerifyEmailNotification from '#mails/verify_email_notification'
import Account from '#models/account'
import router from '@adonisjs/core/services/router'
import mail from '@adonisjs/mail/services/main'

export default class VerificationService {
  static async sendVerificationEmail(account: Account) {
    await mail.sendLater(new VerifyEmailNotification(account))
  }
  static makeSignedUrl(email: string, routeIdentifier: string) {
    return router.makeSignedUrl(
      routeIdentifier,
      { email },
      { expiresIn: '1h', purpose: 'email_verification' }
    )
  }
}
