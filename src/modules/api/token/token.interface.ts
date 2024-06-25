export interface CoinmarketcapResponse {
  data: Array<{
    id: number
    name: string
    symbol: string
    last_updated: string
    quote: {
      USD: {
        price: number
        last_updated: string
      }
    }
  }>
}

export const TOKEN_MODULE_OPTIONS = 'TOKEN_MODULE_OPTIONS'

export interface TokenModuleOptions {
  coinmarketcap: {
    endPoint: string
    apiKey: string
  }
}
