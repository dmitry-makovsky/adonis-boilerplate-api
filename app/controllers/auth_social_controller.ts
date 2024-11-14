import Account from '#models/account'
import SocialAccount from '#models/social_account'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthSocialController {
  async redirectToProvider({ ally, params }: HttpContext) {
    const driverInstance = ally.use(params.provider)
    return driverInstance.redirect()
  }
  async handleProviderCallback({ ally, response, params }: HttpContext) {
    const driverInstance = ally.use(params.provider)

    if (driverInstance.accessDenied()) {
      return response.forbidden({
        code: 'social_user_cancelled',
        message: 'You have cancelled the login process',
      })
    }
    if (driverInstance.stateMisMatch()) {
      return response.forbidden({
        code: 'social_state_mismatch',
        message: 'We are unable to verify the request. Please try again',
      })
    }
    if (driverInstance.hasError()) {
      return response.badRequest({
        code: 'social_error',
        message: driverInstance.getError() || 'Unable to process the request. Please try again',
      })
    }
    const user = await driverInstance.user()
    if (!user) {
      return response.badRequest({
        code: 'social_error',
        message: 'Unable to retrieve user details. Please try again',
      })
    }
    if (!user.email) {
      return response.badRequest({
        code: 'social_email_missing',
        message: 'Your email is missing from the social profile. Please provide an email address',
      })
    }
    if (user.emailVerificationState !== 'verified') {
      return response.badRequest({
        code: 'social_email_unverified',
        message:
          'Your email address is not verified. Please verify your email address on the social platform and try again',
      })
    }

    let account = await Account.findBy('email', user.email)
    if (!account) {
      account = await Account.create({ email: user.email })
    }

    let socialAccount = await SocialAccount.findBy({
      providerName: params.provider,
      providerAccountId: user.id,
    })

    if (socialAccount && socialAccount.accountId !== account.id) {
      return response.badRequest({
        code: 'social_account_already_linked',
        message: 'This social account is already linked to another account',
      })
    }

    if (socialAccount) {
      await socialAccount
        .merge({
          name: user.name,
          avatarUrl: user.avatarUrl,
        })
        .save()
    }

    socialAccount = await account.related('socialAccounts').create({
      providerName: params.provider,
      providerAccountId: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
    })

    const token = await Account.accessTokens.create(account, ['*'], {
      name: 'api_token',
      expiresIn: '30 days',
    })

    return response.created({
      account,
      socialAccount,
      token,
      code: 'social_login_success',
      message: 'You have successfully logged in',
    })
  }
}
