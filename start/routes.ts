/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const RegisterController = () => import('#controllers/register_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.post('auth/register', [RegisterController, 'store']).as('auth.register')
