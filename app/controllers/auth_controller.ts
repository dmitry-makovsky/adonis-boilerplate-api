import type { HttpContext } from '@adonisjs/core/http'
import Account from '#models/account'
import { registerValidator, loginValidator } from '#validators/auth'
import VerificationService from '#services/verification_service'

export default class AuthController {
  public async register({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(registerValidator)
      const account = await Account.create(data)
      await account.refresh()

      if (!account.isActivated) {
        await VerificationService.sendVerificationEmail(account)
      }

      const token = await Account.accessTokens.create(account, ['*'], {
        name: 'api_token',
        expiresIn: '30 days',
      })
      return response.created({
        account,
        token,
        code: 'account_created',
        message: 'Account has been created',
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.badRequest({
          code: 'invalid_credentials',
          message: 'We were unable to process your request. Please check your information.',
        })
      }
      throw error
    }
  }
  public async login({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(loginValidator)
      const account = await Account.verifyCredentials(data.email, data.password)
      const token = await Account.accessTokens.create(account)
      return response.created({
        account,
        socialAccount: null,
        token,
        code: 'login_success',
        message: 'You have successfully logged in',
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR' || error.code === 'E_INVALID_CREDENTIALS') {
        return response.badRequest({
          code: 'invalid_credentials',
          message: 'We were unable to process your request. Please check your information.',
        })
      }
      throw error
    }
  }
  public async logout({ auth }: HttpContext) {
    const account = auth.user!
    await Account.accessTokens.delete(account, account.currentAccessToken.identifier)
    return {
      code: 'logout_success',
      message: 'You have successfully logged out',
    }
  }
  public async account({ auth }: HttpContext) {
    await auth.check()
    return {
      account: auth.user,
    }
  }
}
