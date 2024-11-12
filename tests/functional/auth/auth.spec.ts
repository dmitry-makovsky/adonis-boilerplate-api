import { test } from '@japa/runner'
import Account from '#models/account'
import { testAccount, testEmail } from '#tests/__fixtures/accounts'
import testUtils from '@adonisjs/core/services/test_utils'
import mail from '@adonisjs/mail/services/main'

test.group('Account registration', (group) => {
  group.setup(() => testUtils.db().withGlobalTransaction())
  // 1. Register a new user
  test('Registred test account', async ({ client, route, assert, cleanup }) => {
    mail.fake()
    const response = await client.post(route('auth.register')).json(testAccount)
    response.assertStatus(201)
    const accountFromDb = await Account.findBy('email', testEmail)
    assert.exists(accountFromDb)
    cleanup(() => {
      mail.restore()
    })
  })
  // 1.1. Try to register the same user again
  test('Account already exists', async ({ client, route }) => {
    const response = await client.post(route('auth.register')).json(testAccount)
    response.assertStatus(400)
  })
})

test.group('Account login', async (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(async () => {
    const acc = await Account.create(testAccount)
    await Account.accessTokens.create(acc, ['*'])
  })

  // 2. Login with the registered user
  test('Login with test account', async ({ client, route }) => {
    const response = await client.post(route('auth.login')).json({
      email: testEmail,
      password: testAccount.password,
    })
    response.assertStatus(201)
  })
  // 2.1. Try to login with the wrong password
  test('Login with wrong password', async ({ client, route }) => {
    const response = await client.post(route('auth.login')).json({
      email: testEmail,
      password: 'wrong_password',
    })
    response.assertStatus(400)
  })
  // 2.2. Try to login with the wrong email
  test('Login with wrong email', async ({ client, route }) => {
    const response = await client.post(route('auth.login')).json({
      email: testEmail + '1',
      password: testAccount.password,
    })
    response.assertStatus(400)
  })
})

test.group('Account logout', (group) => {
  let account
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(async () => {
    account = await Account.create(testAccount)
    await Account.accessTokens.create(account, ['*'])
  })
  // 3. Logout the user
  test('Logout test account', async ({ client, route }) => {
    const response = await client.delete(route('auth.logout')).loginAs(account!)
    response.assertStatus(200)
  })
  // 3.1. Try to logout without a token
  test('Logout without token', async ({ client, route }) => {
    const response = await client.delete(route('auth.logout'))
    response.assertStatus(401)
  })
})
