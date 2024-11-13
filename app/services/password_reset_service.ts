import Account from '#models/account'
import router from '@adonisjs/core/services/router'
import mail from '@adonisjs/mail/services/main'
import PasswordRecoveryEmailNotification from '#mails/password_recovery_email_notification'

export default class PasswordResetService {
  static async sendPasswordRecoveryEmail(account: Account) {
    await mail.sendLater(new PasswordRecoveryEmailNotification(account))
  }
  static makeSignedUrl(email: string) {
    return router.makeSignedUrl(
      'recovery.new-password.form',
      { email },
      { expiresIn: '1h', purpose: 'password_reset' }
    )
  }
}
