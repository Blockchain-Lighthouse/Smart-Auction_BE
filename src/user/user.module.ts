import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionModule } from 'src/auction/auction.module';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/entities/user.entity';
import { WalletModule } from 'src/wallet/wallet.module';
import { UserController } from './controller/user.controller';
import { UserRepository } from './repository/user.repository';
import { UserService } from './service/user.service';
import { FavoriteRepository } from '../auction/repository/favorite.repository';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { AwsModule } from 'src/aws/aws.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports : [
    ConfigModule.forRoot(),
    MailerModule.forRoot({
      transport : {
        service : 'gmail',
        // host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.GMAIL_SMTP,
          pass: process.env.GMAIL_SMTP_PW,
        },
      },
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    WalletModule,
    AuctionModule,
    AwsModule,
    RedisModule
  ],
  providers: [UserService, UserRepository, FavoriteRepository],
  controllers: [UserController],
  exports: [UserRepository]
})

export class UserModule {}
