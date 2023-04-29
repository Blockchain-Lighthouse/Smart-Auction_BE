import { Module, forwardRef } from '@nestjs/common';
import { WalletService } from './service/wallet.service';
import { WalletController } from './controller/wallet.controller';
import { UserModule } from 'src/user/user.module';
import { AuctionModule } from 'src/auction/auction.module';
import { RedisModule } from 'src/redis/redis.module';
import { ethers } from 'ethers';
import { ConfigModule } from '@nestjs/config';
import { Alchemy, AlchemyProvider, Network } from 'alchemy-sdk';
import { url } from 'inspector';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AuctionModule),
    RedisModule
  ],
  providers: [
    WalletService,
  ],
  exports: [WalletService],
  controllers: [WalletController]
})

export class WalletModule {}
