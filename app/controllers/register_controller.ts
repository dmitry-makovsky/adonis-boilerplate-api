import type { HttpContext } from '@adonisjs/core/http'
import Account from '#models/account'
import { registerValidator } from '#validators/auth'

export default class RegisterController {
  public async store({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(registerValidator)
      const account = await Account.create(data)
      await account.refresh()
      const token = await Account.accessTokens.create(account, ['*'], {
        name: 'api_token',
        expiresIn: '30 days',
      })
      return response.created({
        account,
        token,
        messages: [
          {
            code: 'account_created',
            message: 'Account has been created',
          },
        ],
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.badRequest({
          errors: [
            {
              code: 'invalid_data',
              message: 'We were unable to process your request. Please check your information.',
            },
          ],
        })
      }
      throw error
    }
  }
}
