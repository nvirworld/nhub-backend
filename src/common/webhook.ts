import { APP } from '@/app.config'
import { IncomingWebhook } from '@slack/webhook'

const webhook = new IncomingWebhook(APP.BRIDGE_ERROR_WEBHOOK)

export default webhook
