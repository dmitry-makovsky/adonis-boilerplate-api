import { test } from '@japa/runner'
import { testAccount } from '#tests/__fixtures/accounts'
import testUtils from '@adonisjs/core/services/test_utils'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailNotification from '#mails/verify_email_notification'
import env from '#start/env'
import Account from '#models/account'

test.group('Verification Links', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('Verification link works as expected', async ({ client, route, cleanup, assert }) => {
    const { mails } = mail.fake()
    await client.post(route('auth.register')).json(testAccount)

    mails.assertQueuedCount(VerifyEmailNotification, 1)

    const queuedEmails = mails.queued()
    const email = queuedEmails.find((item) => {
      return item instanceof VerifyEmailNotification
    })
    const messageText = email?.message.toJSON().message.text?.toString()

    const linkRegexp = new RegExp(`${env.get('APP_URL')}(.+?)(?:\\s|$)`)
    const activateLink = messageText?.match(linkRegexp)?.[1]

    if (!activateLink) {
      throw new Error('Activation link not found')
    }

    await client.get(activateLink)

    const account = await Account.findByOrFail('email', testAccount.email)

    assert.isTrue(account.isActivated)
    cleanup(() => {
      mail.restore()
    })
  })
})
