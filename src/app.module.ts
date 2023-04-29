import { CacheModule, Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseInterceptor } from './common/response.interceptor';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import * as RedisStore from "cache-manager-ioredis";
import { AuctionModule } from './auction/auction.module';
import { ContractModule } from './contract/contract.module';
import { AwsModule } from './aws/aws.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    // Config environmentFile
    ConfigModule.forRoot(),
    
    // Config TypeORM
    TypeOrmModule.forRoot({
      type : 'mysql',
      host : process.env.DATABASE_HOST,
      port : parseInt(process.env.DATABASE_PORT),
      username : process.env.DATABASE_USER,
      password : process.env.DATABASE_PASSWORD,
      database : process.env.DATABASE_DB,
      entities : [__dirname + "/entities/**/*.entity.{js,ts}"],
      synchronize : true,
      timezone : "Asia/Seoul"
    }),

    // Redis Configuration
    CacheModule.register({
      isGlobal : true,
      store : RedisStore,
      host: process.env.REDIS_IP,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      ttl : 100
    }),

    // Config Modules
    UserModule,
    AuthModule,
    WalletModule,
    AuctionModule,
    ContractModule,
    AwsModule,
    RedisModule,
  ],

  providers: [
    {
      provide : APP_INTERCEPTOR,
      useClass : ResponseInterceptor,
    },
  ],
})

export class AppModule {}
