import queueConfig from '#config/queue'
import { Queue } from 'bullmq'

export const emailsQueue = new Queue('emails', {
  ...queueConfig,
  defaultJobOptions: {
    ...queueConfig.defaultJobOptions,
    attempts: 1,
  },
})
