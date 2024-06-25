import { ResourceWithOptions } from 'adminjs'

export interface ResourceInterface {
  getResource: () => Promise<ResourceWithOptions>
}

export const RESOURCE_MODULE_OPTIONS = 'RESOURCE_MODULE_OPTIONS'

export interface ResourceModuleOptions {
  aesSecretKey: string
}
