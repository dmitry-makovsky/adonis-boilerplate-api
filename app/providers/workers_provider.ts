import emailsWorker from '#workers/emails'
import logger from '@adonisjs/core/services/logger'
import { Worker } from 'bullmq'
import redisConnector from '#config/redis'
import mail from '@adonisjs/mail/services/main'
import { emailsQueue } from '#queues/emails'

// List all the workers that should be started on AdonisJs boot
const workers: { [workerName: string]: Worker } = {
  emailsWorker,
}

export default class WorkersProvider {
  /**
   * Starts all the workers during when the application is ready to accept incoming requests.
   * also initializes the stacks queue cron job.
   *
   * More info: https://docs.adonisjs.com/guides/concepts/service-providers#ready
   */
  async ready() {
    // Start all the workers if they are not already running
    for (const workerName in workers) {
      const worker = workers[workerName]
      if (!worker.isRunning()) {
        await worker.run()
      }
      if (workerName === 'emailsWorker') {
        mail.setMessenger((mailer) => {
          return {
            async queue(mailMessage, config) {
              await emailsQueue.add('send_email', {
                mailMessage,
                config,
                mailerName: mailer.name,
              })
            },
          }
        })
      }
    }

    if (Object.keys(workers).length === 0) {
      logger.info('[Workers Provider]: No workers to start, skipping...')
      return
    }

    logger.info(
      `[Workers Provider]: Started all workers successfully (${Object.keys(workers).join(', ')})`
    )
  }

  /**
   * Stops all the workers when the application is shutting down.
   *
   * More info: https://docs.adonisjs.com/guides/concepts/service-providers#shutdown
   */
  async shutdown() {
    if (process.env.NO_LC === 'true') {
      return
    }

    // Stop all the workers if they are running
    for (const workerName in workers) {
      const worker = workers[workerName]

      if (worker.isRunning()) {
        worker.close()
      }
    }

    // Quit the Redis connection if it is not already closed
    if (!['end', 'close'].includes(redisConnector.status)) {
      await redisConnector.quit()
    }

    logger.info(
      `[Workers Provider]: Stopped all workers successfully (${Object.keys(workers).join(', ')})`
    )
  }
}
