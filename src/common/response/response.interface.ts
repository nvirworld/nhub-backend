export interface BaseResponse {
  tid: string
  ts: number
}

export interface DataResponse extends BaseResponse {
  data: any
}

export const IGNORE_RESPONSE_INTERCEPTOR = 'IGNORE_RESPONSE_INTERCEPTOR'
