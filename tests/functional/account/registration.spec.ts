import { test } from '@japa/runner'
import Account from '#models/account'

const testEmail = 'test@mail.com'
const testAccount = {
  fullName: 'Test User',
  email: testEmail,
  password: 'password',
}

test.group('Account registration', () => {
  // 1. Register a new user
  test('Registred test account', async ({ client, route, assert }) => {
    const response = await client.post(route('auth.register')).json(testAccount)
    response.assertStatus(201)
    const accountFromDb = await Account.findBy('email', testEmail)
    assert.exists(accountFromDb)
  })
  // 1.1. Try to register the same user again
  test('Account already exists', async ({ client, route }) => {
    const response = await client.post(route('auth.register')).json(testAccount)
    response.assertStatus(400)
  })
})
