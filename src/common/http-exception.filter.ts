import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import {catchError} from 'rxjs/operators';
import { IncomingWebhook } from '@slack/client';
import * as Sentry from '@sentry/node';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly webhook: IncomingWebhook;

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response : Response = ctx.getResponse();
    const request : Request = ctx.getRequest();
    const status = exception.getStatus();
    let error : any = exception.getResponse() as string | { error : string; statusCode : number; message : string };
    console.log(error);
    if (typeof error == "object") {
      error = error.message
    }
    
    // Slack Err MSG
    const slack = new IncomingWebhook(process.env.SLACK_WEBHOOK);
    const KST = 1000 * 60 * 60 * 9;
    const koreaNow = new Date((new Date()).getTime() + KST);

    slack.send(`
      🚨 ERROR - SMART AUCTION SERVER 🚨
      경로 : ${request.url} \n
      상태 : ${status} \n
      발생시각 : ${koreaNow.toISOString()} \n
      에러 : ${error} \n
    `);

    // Response Transform
    response.status(status).json({
        statusCode: status,
        message: error,
    })
  }
}