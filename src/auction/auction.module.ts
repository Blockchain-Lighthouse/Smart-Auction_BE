import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Auction } from 'src/entities/auction.entity';
import { AuctionController } from './controller/auction.controller';
import { AuctionRepository } from './repository/auction.repository';
import { AuctionService } from './service/auction.service';
import { ContractModule } from 'src/contract/contract.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { BidLogs } from 'src/entities/bidLog.entity';
import { BidRepository } from './repository/bid.repository';
import { Scheduler } from './service/scheduler.service';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from 'src/redis/redis.module';
import { FavoriteRepository } from './repository/favorite.repository';

@Module({
  imports : [
    TypeOrmModule.forFeature([Auction, BidLogs]),
    forwardRef(() =>ContractModule),
    AuthModule,
    WalletModule,
    forwardRef(() => UserModule),
    RedisModule
  ],
  providers: [
    AuctionService,
    AuctionRepository,
    BidRepository,
    FavoriteRepository,
    Scheduler,
  ],
  controllers: [AuctionController],
  exports : [
    AuctionRepository,
    BidRepository,
  ]
})

export class AuctionModule {}
