import * as crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'

const toIv = (secretKey: string) => {
  return crypto
    .createHash('sha256')
    .update(secretKey)
    .digest('hex')
    .substring(0, 16)
}

export const encryptAES = (
  data: string,
  salt: crypto.CipherKey,
  secretKey: string
) => {
  const cipher = crypto.createCipheriv('aes-256-cbc', salt, toIv(secretKey))
  let encryptedText = cipher.update(data, 'utf8', 'base64')
  encryptedText += cipher.final('base64')
  return encryptedText
}

export const decryptAES = (
  data: string,
  salt: crypto.CipherKey,
  secretKey: string
) => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', salt, toIv(secretKey))
  let decryptedText = decipher.update(data, 'base64', 'utf8')
  decryptedText += decipher.final('utf8')
  return decryptedText
}

export const randomSalt = (length: number) => {
  return crypto
    .createHash('sha512')
    .update(uuidv4())
    .digest('hex')
    .substring(0, length)
}
