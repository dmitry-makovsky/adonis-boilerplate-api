import { test } from '@japa/runner'
import { testAccount } from '#tests/__fixtures/accounts'
import testUtils from '@adonisjs/core/services/test_utils'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailNotification from '#mails/verify_email_notification'
import env from '#start/env'
import Account from '#models/account'

test.group('Verification Emails', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('Email on account creation sended', async ({ client, route, cleanup }) => {
    const { mails } = mail.fake()
    await client.post(route('auth.register')).json(testAccount)

    mails.assertQueuedCount(VerifyEmailNotification, 1)

    const queuedEmails = mails.queued()
    const email = queuedEmails.find((item) => {
      return item instanceof VerifyEmailNotification
    })

    email?.message.assertTo(testAccount.email)
    email?.message.assertFrom(env.get('MAIL_FROM'))
    email?.message.assertSubject('Verify your account')
    cleanup(() => {
      mail.restore()
    })
  })
  test('Resend email verification link', async ({ client, route, cleanup }) => {
    const { mails } = mail.fake()
    await client.post(route('auth.register')).json(testAccount)
    mails.assertQueuedCount(VerifyEmailNotification, 1)

    const account = await Account.findByOrFail('email', testAccount.email)
    await client.post(route('verification.email.send')).loginAs(account)

    mails.assertQueuedCount(VerifyEmailNotification, 2)

    cleanup(() => {
      mail.restore()
    })
  })
})
