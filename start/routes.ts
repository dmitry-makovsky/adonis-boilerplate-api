/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const AuthController = () => import('#controllers/auth_controller')
const EmailVerificationsController = () => import('#controllers/email_verification_controller')
const PasswordResetController = () => import('#controllers/auth_password_reset_controller')
const AuthSocialController = () => import('#controllers/auth_social_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

/**
 * Auth routes
 */
router.post('/auth/registration', [AuthController, 'register']).as('auth.register')
router.post('/auth/login', [AuthController, 'login']).as('auth.login')
router.delete('/auth/logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())
router.get('/auth/account', [AuthController, 'account']).as('auth.account').use(middleware.auth())

/**
 * Verification routes
 */
router
  .post('/verification/email/send', [EmailVerificationsController, 'send'])
  .as('verification.email.send')
  .use(middleware.auth())
router
  .get('/verification/email/verify/:email', [EmailVerificationsController, 'verify'])
  .as('verification.email.verify')
  .use([middleware.session(), middleware.shield()])

/**
 * Password reset routes
 */
router
  .post('/recovery/reset', [PasswordResetController, 'sendResetLink'])
  .as('recovery.password.send-reset-link')

router
  .group(() => {
    router
      .get('/recovery/password/:email', [PasswordResetController, 'newPasswordForm'])
      .as('recovery.new-password.form')
    router
      .post('/recovery/new-password', [PasswordResetController, 'newPasswordStore'])
      .as('recovery.new-password.store')
  })
  .use([middleware.session(), middleware.shield()])

/**
 * Social auth routes
 */
router
  .get('/auth/:provider', [AuthSocialController, 'redirectToProvider'])
  .where('provider', /google|vk/)
  .as('auth.social.redirect')

router
  .get('/auth/:provider/callback', [AuthSocialController, 'handleProviderCallback'])
  .where('provider', /google|vk/)
  .as('auth.social.callback')
