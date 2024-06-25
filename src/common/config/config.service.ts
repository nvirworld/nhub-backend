import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'
import { Inject, Injectable } from '@nestjs/common'
import axios from 'axios'
import { ConfigModuleOptions } from './config.interface'
import { MODULE_OPTIONS_TOKEN } from './config.module-definition'

@Injectable()
export class ConfigService {
  private readonly client: SecretsManagerClient
  private readonly secretKey: string
  private isLoaded = false
  private secrets: Record<string, string> = {}

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly configModuleOptions: ConfigModuleOptions
  ) {
    if (configModuleOptions.isLambdaExtension !== true) {
      this.client = new SecretsManagerClient(
        configModuleOptions.secretManagerClientOptions
      )
    }
    this.secretKey = configModuleOptions.secretKey
  }

  async get(key: string): Promise<any> {
    if (!this.isLoaded) {
      let secretData
      try {
        if (this.configModuleOptions.isLambdaExtension === true) {
          // lambda 의 경우 axios 를 사용한다
          const { lambdaExtensionOptions } = this.configModuleOptions
          const { data } = await axios.get(
            `${lambdaExtensionOptions.endpoint}/secretsmanager/get?secretId=${this.secretKey}`,
            {
              headers: {
                'X-Aws-Parameters-Secrets-Token':
                  lambdaExtensionOptions.sessionToken
              }
            }
          )
          secretData = data
        } else {
          secretData = await this.client.send(
            new GetSecretValueCommand({
              SecretId: this.secretKey
            })
          )
        }

        if ('SecretString' in secretData && secretData.SecretString != null) {
          this.secrets = JSON.parse(secretData.SecretString)
        } else {
          throw new Error('SecretString is not exist')
        }
      } catch (err) {
        if (err instanceof Error) {
          let message = `getSecretValueError | key : ${this.secretKey} | ${err.message}`
          const axiosResponseData = (err as any).response?.data
          if (axiosResponseData != null) {
            message += ' | ' + JSON.stringify(axiosResponseData)
          }
          throw new Error(message)
        } else {
          throw err
        }
      }
      this.isLoaded = true
    }
    return this.secrets[key]
  }
}
