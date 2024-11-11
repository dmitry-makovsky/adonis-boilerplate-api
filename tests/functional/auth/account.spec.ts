import { test } from '@japa/runner'
import Account from '#models/account'
import { testAccount } from '#tests/__fixtures/accounts'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Get account', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  // Get the account of the logged in user
  test('Get account', async ({ client, route }) => {
    const account = await Account.create(testAccount)
    const response = await client.get(route('auth.account')).loginAs(account)
    response.assertStatus(200)
  })
})
