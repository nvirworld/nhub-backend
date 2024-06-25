import { HttpStatus } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { LogData, LoggerService } from './'

export const getMiddleware = (loggerService: LoggerService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now()
    const send = res.send
    res.send = responseBody => {
      const status = res.statusCode
      const message = `${req.method} ${req.url}`
      const user = res.locals.user
      const error = res.locals.error
      const logData: LogData = {
        user,
        req,
        res: {
          status,
          responseBody,
          responseTime: Date.now() - startTime
        }
      }
      if (error != null) {
        logData.err = { stack: error.stack, error }
      }
      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        loggerService.err(message, logData)
      } else if (status >= HttpStatus.BAD_REQUEST) {
        loggerService.warn(message, logData)
      } else {
        loggerService.info(message, logData)
      }
      res.send = send
      return res.send(responseBody)
    }

    next()
  }
}
