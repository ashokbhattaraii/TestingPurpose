import { Global, Module } from '@nestjs/common'
import { RsOfficeClient } from '@rumsan/user'

/** Injection token for the RsOfficeClient instance. */
export const RS_OFFICE_CLIENT = Symbol('RS_OFFICE_CLIENT')

/**
 * Global NestJS module that provides a shared RsOfficeClient.
 * Reads RS_USER_URL from the environment — set in .env.
 *
 * Because this module is @Global(), any module that imports it (directly or
 * via AppModule) can inject RS_OFFICE_CLIENT without re-importing here.
 */
@Global()
@Module({
  providers: [
    {
      provide: RS_OFFICE_CLIENT,
      useFactory: (): RsOfficeClient => {
        const baseUrl = process.env.RS_USER_URL
        if (!baseUrl) throw new Error('RS_USER_URL env var is required')
        return new RsOfficeClient({ baseUrl })
      },
    },
  ],
  exports: [RS_OFFICE_CLIENT],
})
export class RsOfficeModule {}
