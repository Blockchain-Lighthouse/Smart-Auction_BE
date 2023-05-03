import { Module, forwardRef } from '@nestjs/common';
import { ethers } from 'ethers';
import { ContractService } from './service/contract.service';
import { AuctionModule } from 'src/auction/auction.module';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [],
  imports : [
    ConfigModule.forRoot(),
    forwardRef(()=> AuctionModule),
    forwardRef(()=> UserModule)
  ],
  providers: [
    {
      provide : ethers.providers.JsonRpcProvider,
      useFactory: () => new ethers.providers.JsonRpcProvider("http://52.78.209.196:8545")
    },
    ContractService,
  ],
  exports:[ContractService]
})

export class ContractModule {}
