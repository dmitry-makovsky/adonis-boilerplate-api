import env from '#start/env'
import { defineConfig, services } from '@adonisjs/ally'
import { VkDriverService } from 'adonis6_ally_vk'
import { YandexDriverService } from 'adonis6_ally_yandex'

const allyConfig = defineConfig({
  google: services.google({
    clientId: env.get('GOOGLE_CLIENT_ID'),
    clientSecret: env.get('GOOGLE_CLIENT_SECRET'),
    callbackUrl: `${env.get('APP_URL')}/auth/google/callback`,
  }),
  yandex: YandexDriverService({
    clientId: env.get('YANDEX_CLIENT_ID'),
    clientSecret: env.get('YANDEX_CLIENT_SECRET'),
    callbackUrl: `${env.get('APP_URL')}/auth/yandex/callback`,
  }),
  vk: VkDriverService({
    clientId: env.get('VK_CLIENT_ID'),
    clientSecret: env.get('VK_CLIENT_SECRET'),
    callbackUrl: `${env.get('APP_URL')}/auth/vk/callback`,
  }),
})

export default allyConfig

declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
