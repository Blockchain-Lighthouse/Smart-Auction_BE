import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as expressBasicAuth from "express-basic-auth";
import * as Sentry from '@sentry/node';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // @ Exception Filter 
  app.useGlobalFilters(new HttpExceptionFilter());
  // @ Validation Pipe
  app.useGlobalPipes(new ValidationPipe());
 
  // @ Swagger 
  // Swagger Auth
  app.use(
    ["/docs"],
    expressBasicAuth({
      challenge : true,
      users: {
        [process.env.SWAGGER_ID] : process.env.SWAGGER_PW
      }
    })
  )

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Smart Auction')
    .setDescription('Smart Auction Swagger')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type : 'http',
        scheme : 'bearer',
        bearerFormat : "JWT",
        name : "JWT",
        description: "Enter Access JWT Token",
        in : "header"
      },
      'accesskey',
    )
    .addBearerAuth(
      {
        type : 'http',
        scheme : 'bearer',
        bearerFormat : "JWT",
        name : "JWT",
        description: "Enter refresh JWT Token",
        in : "header"
      },
      'refreshkey',
    )
    .addBearerAuth(
      {
        type : 'http',
        scheme : 'bearer',
        bearerFormat : "JWT",
        name : "JWT",
        description: "Enter reset JWT Token",
        in : "header"
      },
      'resetkey',
    )
    .build()

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // @ CORS
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "http://smart-auction.vercel.app",
      "https://smart-auction.vercel.app"
    ],
    methods: "GET,POST,PATCH,HEAD",
    credentials: true,
  });

  // @ Swagger
  await app.listen(process.env.SERVER_PORT);
}

bootstrap();
