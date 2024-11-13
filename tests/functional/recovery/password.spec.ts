import { test } from '@japa/runner'
import { testAccount, testEmail } from '#tests/__fixtures/accounts'
import testUtils from '@adonisjs/core/services/test_utils'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import Account from '#models/account'
import PasswordRecoveryEmailNotification from '#mails/password_recovery_email_notification'

const createTestAccount = async () => {
  const account = await Account.create(testAccount)
  account.isActivated = true
  await account.save()
}

const parseResetLink = (email: any) => {
  const resetLink = email?.message
    .toJSON()
    .message.html?.toString()
    .match(/href="([^"]+)"/)?.[1]
  if (!resetLink) {
    throw new Error('Reset link not found')
  }
  return resetLink
}

const getRecoveryEmail = (mails: any) => {
  const queuedEmails = mails.queued()
  const email = queuedEmails.find((item: any) => {
    return item instanceof PasswordRecoveryEmailNotification
  })
  if (!email) {
    throw new Error('Password recovery email not found')
  }
  return email
}

const parseHiddenInputs = (html: string) => {
  const email = html.match(/name="email" value="([^"]+)"/)?.[1]
  const token = html.match(/name="token" value="([^"]+)"/)?.[1]
  return { email, token }
}
test.group('Password recovery', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('Email on password recovery request sended', async ({ client, route, cleanup }) => {
    const { mails } = mail.fake()
    await createTestAccount()
    await client.post(route('recovery.password.send-reset-link')).json({ email: testAccount.email })

    mails.assertQueuedCount(PasswordRecoveryEmailNotification, 1)

    cleanup(() => {
      mail.restore()
    })
  })

  test('Password reset process working correctly', async ({ client, route, cleanup }) => {
    const { mails } = mail.fake()
    await createTestAccount()

    // 1. Check login

    const oldLoginResponse = await client.post(route('auth.login')).json({
      email: testEmail,
      password: testAccount.password,
    })
    oldLoginResponse.assertStatus(201)

    // 2. Request password reset

    await client.post(route('recovery.password.send-reset-link')).json({ email: testAccount.email })

    const email = getRecoveryEmail(mails)
    email?.message.assertTo(testAccount.email)
    email?.message.assertFrom(env.get('MAIL_FROM'))
    email?.message.assertSubject('Password recovery')

    // 3. Get and click on the reset link

    const resetLinkFormResponse = await client.get(parseResetLink(email))

    // 4. Get form data and post form with new password

    const inputs = parseHiddenInputs(resetLinkFormResponse.text())
    const newPassword = 'new-password'
    const postedFormResponse = await client
      .post(route('recovery.new-password.store'))
      .form({
        token: inputs.token,
        email: inputs.email,
        password: newPassword,
      })
      .withCsrfToken()

    postedFormResponse.assertStatus(200)

    // 5. Check login with new password

    const newLoginResponse = await client.post(route('auth.login')).json({
      email: testEmail,
      password: newPassword,
    })

    newLoginResponse.assertStatus(201)
    cleanup(() => {
      mail.restore()
    })
  })
})
