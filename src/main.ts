import { APP } from '@/app.config'
import { NODE_ENV } from '@/common/env'
import { LoggerService } from '@/common/logger'
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { userInfo } from 'os'
import { AppModule } from './app.module'

async function bootstrap() {
  if (APP.ENV.nodeEnv === NODE_ENV.local) {
    const client = new STSClient({ region: APP.AWS.REGION })
    const command = new AssumeRoleCommand({
      RoleArn: APP.AWS.DEV_ARN,
      RoleSessionName: userInfo().username
    })
    const { AssumedRoleUser, Credentials } = await client.send(command)

    if (AssumedRoleUser == null || Credentials == null) {
      throw new Error('Assume Role 권한없음')
    }
    console.log(`Assumed Role User >> ${AssumedRoleUser.Arn ?? ''}`)
    APP.AWS.CREDENTIALS = {
      accessKeyId: Credentials.AccessKeyId ?? '',
      secretAccessKey: Credentials.SecretAccessKey ?? '',
      sessionToken: Credentials.SessionToken ?? ''
    }
  }
  const app = await NestFactory.create(AppModule, {
    logger: APP.ENV.nodeEnv === NODE_ENV.local ? undefined : false,
    abortOnError: false
  })
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true
    })
  )
  // TODO:
  app.enableCors({
    origin: '*',
    credentials: true
  })

  const loggerService = app.get(LoggerService)
  await app.listen(APP.PORT)
  return loggerService
}
bootstrap()
  .then((loggerService: LoggerService) => {
    loggerService.info('started', { APP })
  })
  .catch(console.error)
