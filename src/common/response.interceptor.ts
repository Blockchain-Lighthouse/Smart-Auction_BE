import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomResponseType } from 'src/types/response';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res : Response = context.switchToHttp().getResponse();

    return next
      .handle()
      .pipe(map((data) => {
        let response : CustomResponseType<typeof data> = {
            statusCode : res.statusCode,
            payload : data,
        }
        return response;
      }));
  }
}