import { BadRequestException, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import { CONTRACT_AUCTION, CONTRACT_FACTORY } from '../abi/contract';
import { AuctionRepository } from 'src/auction/repository/auction.repository';
import { BidRepository } from 'src/auction/repository/bid.repository';
import { UserRepository } from 'src/user/repository/user.repository';

@Injectable()
export class EventService implements OnModuleInit {
    constructor(
        @Inject(ethers.providers.JsonRpcProvider) private readonly provider : ethers.providers.JsonRpcProvider,
        private readonly bidRepo : BidRepository,
        private readonly auctionRepo : AuctionRepository,
        private readonly userRepo : UserRepository,
    ){
        // Factory Contract;
        this.factoryContract = new ethers.Contract(
            CONTRACT_FACTORY.address, 
            CONTRACT_FACTORY.abi, 
            this.provider
        );
    }
    // Module 초기화시 실행.
    onModuleInit() {
        // console.log(`ONMODULEINIT ACT`)
        // this.factory_createAuctionEvent();
    }

    private factoryContract;

    // /**
    //  * Events
    //  */
    // async factory_createAuctionEvent() {
    //     await this.factoryContract.on('AuctionCreated', async(auctionId, auctionContract, caller, price, occurredAt, event) => {
    //         // Create Bid Logs            
    //         const bidder = await this.userRepo.getUserByEoa(caller);
    //         await this.bidRepo.createbidLog(auctionId.toNumber(), auctionContract, bidder.id, price.toString());

    //         // 즉구처리
    //         // 즉구가가 입력되었다다면 Auction Status 변경 =>
    //         const auction = await this.auctionRepo.getAuctionsById(auctionId.toNumber());

    //         const etherValue = ethers.utils.formatEther(price);

    //         console.log(etherValue);
    //         if(auction.maxPrice == etherValue) {
    //             // Auction Status => 3
    //             await this.auctionRepo.updateAuctionStatus(auctionId.toNumber(), 3);
    //         } else {
    //             await this.auctionRepo.updateAuctionStatus(auctionId.toNumber(), 2);
    //         }
 
    //     });
    // }

    // async auction_event() {
    //     // Auction 글 중 현재 활성화 되어있는 글만 탐색
    //     const activatedAuction = await this.auctionRepo.getActivatedAuction();

    //     // 해당 글에 대하여 Contract Event Listening On
    //     let addresses : string[] = [];


    //     for (let i=0; i < activatedAuction?.length; i++) {
    //         if(activatedAuction[i].contract) {
    //             await addresses.push(activatedAuction[i].contract);
    //         }
    //     }
        
    //     for (let i=0; i < addresses?.length; i++) {
    //         const auctionContract = await new ethers.Contract(
    //             addresses[i], 
    //             CONTRACT_AUCTION.abi, 
    //             this.provider
    //         )

    //         // Create Auction 이후 입찰발생
    //         auctionContract.on("Bid", async(auctionId, auctionContract, caller, price, occuredAt, event) => {
    //             console.log(`AUCTION BID EVENT 발생!`)
    //             // Create Bid Logs
    //             const bidder = await this.userRepo.getUserByEoa(caller);
    //             await this.bidRepo.createbidLog(auctionId.toNumber(), auctionContract, bidder.id, price.toString());

    //             // 즉구처리
    //             // 즉구가가 입입력력되되었었다다면 Auction Status 변경 =>
    //             const auction = await this.auctionRepo.getAuctionsById(auctionId.toNumber());
    //             const etherValue = ethers.utils.formatEther(price);

    //             if(auction.maxPrice == etherValue) {
    //                 // Auction Status => 3
    //                 await this.auctionRepo.updateAuctionStatus(auctionId, 4);
    //             } else {
    //                 await this.auctionRepo.updateAuctionStatus(auctionId, 3);
    //             }
    //         })
    //     }
    // }
}
