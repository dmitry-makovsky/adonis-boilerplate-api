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

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

/**
 * Auth routes
 */
router.post('/auth/register', [AuthController, 'register']).as('auth.register')
router.post('/auth/login', [AuthController, 'login']).as('auth.login')
router.delete('/auth/logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())
router.get('/auth/account', [AuthController, 'account']).as('auth.account')

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
