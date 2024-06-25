import { SecretsManagerClientConfig } from '@aws-sdk/client-secrets-manager/dist-types/SecretsManagerClient'

export interface SecretManagerClientOptions extends SecretsManagerClientConfig {
  region: string
}

export interface LambdaExtensionOptions {
  endpoint: string
  sessionToken: string
}

export interface ConfigModuleBasicOptions {
  isLambdaExtension?: false
  secretManagerClientOptions: SecretManagerClientOptions
  secretKey: string
}
export interface ConfigModuleLambdaExtensionOptions {
  isLambdaExtension: true
  lambdaExtensionOptions: LambdaExtensionOptions
  secretKey: string
}

export type ConfigModuleOptions =
  | ConfigModuleBasicOptions
  | ConfigModuleLambdaExtensionOptions
