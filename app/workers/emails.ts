import workerConfig from '#config/worker'
import { type Job, Worker } from 'bullmq'
import { emailsQueue } from '#queues/emails'
import logger from '@adonisjs/core/services/logger'
import mail from '@adonisjs/mail/services/main'

const workerName = '[Emails Worker]'

const emailsWorker = new Worker(
  emailsQueue.name,
  async (job) => {
    logger.debug(`${workerName}: Processing job: ${job.id}...`)

    if (job.name === 'send_email') {
      const { mailMessage, config, mailerName } = job.data
      await mail.use(mailerName).sendCompiled(mailMessage, config)
    }

    logger.debug(`${workerName}: Job ${job.id} processed`)
  },
  workerConfig
)

emailsWorker.on('failed', async (job: Job | undefined) => {
  if (!job) {
    logger.error(`${workerName}: Job failed without any job details`)
    return
  }
  logger.warn(`${workerName}: Job ${job.id} failed with the reason: ${job.failedReason}`)
})

emailsWorker.on('completed', async (job: Job) => {
  logger.info(`${workerName}: Job ${job.id} completed successfully`)
})

export default emailsWorker
