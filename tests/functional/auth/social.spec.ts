import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { testAccount } from '#tests/__fixtures/accounts'
import Account from '#models/account'

test.group('Social auth', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Redirects to Google', async ({ client, route }) => {
    const response = await client
      .get(route('auth.social.redirect', { provider: 'google' }))
      .redirects(0)
    response.assertStatus(302)
  })

  test('Try to login with empty password account (social)', async ({ client, route }) => {
    const account = await Account.create({
      email: testAccount.email,
    })
    await account.related('socialAccounts').create({
      providerName: 'google',
      providerAccountId: '123',
    })
    const response = await client.post(route('auth.login')).json({
      email: testAccount.email,
      password: testAccount.password,
    })
    response.assertStatus(400)
  })
})
