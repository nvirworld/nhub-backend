import { ENV, EnvInterface } from '@/common/env'
import { readFileSync } from 'fs'
let buildVersion = 'unknown'
try {
  buildVersion = readFileSync('/.version', 'utf8').trim()
} catch (err) {}

export interface APPInterface {
  NAME: string
  PORT: number
  AWS: {
    REGION: string
    DEV_ARN: string
    SQS_URL: string
    CREDENTIALS?: {
      accessKeyId: string
      secretAccessKey: string
      sessionToken: string
    }
  }
  ENV: EnvInterface
  BUILD_VERSION: string
  SITE: string
  BRIDGE_ERROR_WEBHOOK: string
}

export const APP: APPInterface = {
  NAME: 'nhub-backend',
  PORT: 80,
  AWS: {
    REGION: 'ap-northeast-2',
    DEV_ARN: 'arn:aws:iam::797127116500:role/nhub-role-backend-prod',
    SQS_URL:
      'https://sqs.ap-northeast-2.amazonaws.com/797127116500/nhub-sqs-api-backend-bridge-prod.fifo'
  },
  ENV,
  BUILD_VERSION: buildVersion,
  SITE: 'https://v2.n-hub.io',
  BRIDGE_ERROR_WEBHOOK:
    'https://hooks.slack.com/services/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'
}
