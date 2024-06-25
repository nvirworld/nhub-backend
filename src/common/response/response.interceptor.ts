import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
  SetMetadata
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
// import tracer from 'dd-trace'
import { map, Observable } from 'rxjs'
import { DataResponse, IGNORE_RESPONSE_INTERCEPTOR } from './response.interface'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle()
    }

    return next.handle().pipe(
      map(body => {
        if (
          this.reflector.get<boolean>(
            IGNORE_RESPONSE_INTERCEPTOR,
            context.getClass()
          )
        ) {
          return body
        } else {
          const statusCode = context.switchToHttp().getResponse().statusCode
          if (statusCode === HttpStatus.CREATED) {
            context.switchToHttp().getResponse().statusCode = HttpStatus.OK
          }

          // TODO:
          // const span = tracer.scope().active()
          // const traceId = span?.context().toTraceId() ?? ''
          const traceId = ''
          const response: DataResponse = {
            data: body,
            tid: traceId,
            ts: Date.now()
          }

          return response
        }
      })
    )
  }
}

export const IgnoreResponseInterceptor = () =>
  SetMetadata(IGNORE_RESPONSE_INTERCEPTOR, true)
