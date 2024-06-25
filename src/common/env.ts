export enum NODE_ENV {
  local = 'local',
  dev = 'dev',
  qa = 'qa',
  prod = 'prod',
  stg = 'stg',
  test = 'test'
}

if (!((process.env.NODE_ENV ?? '') in NODE_ENV)) {
  throw new Error(
    `NODE_ENV 설정이 필요합니다. process.env.NODE_ENV=${
      process.env.NODE_ENV ?? ''
    }`
  )
}

export interface EnvInterface {
  nodeEnv: NODE_ENV
}

export const ENV: EnvInterface = {
  nodeEnv: process.env.NODE_ENV as NODE_ENV
}
