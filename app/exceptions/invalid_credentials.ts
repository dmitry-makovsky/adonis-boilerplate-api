// import type { I18n } from '@adonisjs/i18n'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

type I18n = any

export const E_INVALID_CREDENTIALS = class extends Exception {
  static status: number = 400
  static code: string = 'E_INVALID_CREDENTIALS'

  /**
   * Translation identifier. Can be customized
   */
  identifier: string = 'errors.E_INVALID_CREDENTIALS'

  /**
   * Returns the message to be sent in the HTTP response.
   * Feel free to override this method and return a custom
   * response.
   */
  getResponseMessage(error: this, ctx: HttpContext) {
    if ('i18n' in ctx) {
      return (ctx.i18n as I18n).t(error.identifier, {}, error.message)
    }
    return error.message
  }

  /**
   * Converts exception to an HTTP response
   */
  async handle(error: this, ctx: HttpContext) {
    const message = this.getResponseMessage(error, ctx)

    switch (ctx.request.accepts(['html', 'application/vnd.api+json', 'json'])) {
      case 'html':
      case null:
        if (ctx.session) {
          ctx.session.flashExcept(['_csrf', '_method', 'password', 'password_confirmation'])
          ctx.session.flashErrors({ [error.code!]: message })
          ctx.response.redirect('back', true)
        } else {
          ctx.response.status(error.status).send(message)
        }
        break
      case 'json':
        ctx.response.status(error.status).send({
          errors: [
            {
              message,
            },
          ],
        })
        break
      case 'application/vnd.api+json':
        ctx.response.status(error.status).send({
          errors: [
            {
              code: error.code,
              title: message,
            },
          ],
        })
        break
    }
  }
}
