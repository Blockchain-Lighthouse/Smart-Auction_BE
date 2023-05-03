import { BadRequestException, ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { AuctionRepository } from '../repository/auction.repository';
import { BidDto } from '../dto/bidDto';
import { CreateAuctionDto, CreateAuctionResponse } from '../dto/createAuctionDto';
import { AuctionDetailResponse, GetAuctionResponse } from '../dto/getAuctionDto';
import { ContractService } from 'src/contract/service/contract.service';
import { UserRepository } from 'src/user/repository/user.repository';
import { WalletService } from 'src/wallet/service/wallet.service';
import * as bcrypt from 'bcrypt';
import { GetBiddersResponse } from '../dto/bidHistroyDto';
import { ethers } from 'ethers';
import { WithdarwDto } from '../dto/withdrawDto';
import { BidRepository } from '../repository/bid.repository';
import { Scheduler } from './scheduler.service';
import { RedisRepository } from 'src/redis/redis.repository';
import { FavoriteRepository } from '../repository/favorite.repository';
import { Favorite } from 'src/entities/favorite.entity';
import { User } from 'src/entities/user.entity';
import { AddFavoriteResponse } from '../dto/favoriteDto';
import { TransactionResponse } from '../dto/transactionResponse';
import { NFTStorage, File } from "nft.storage";

@Injectable()
export class AuctionService {
    constructor(
        public readonly auctionRepo : AuctionRepository,
        public readonly bidRepo : BidRepository,
        private readonly userRepo : UserRepository,
        private readonly contractService : ContractService,
        private readonly wallet : WalletService,
        private readonly scheduler : Scheduler,
        private readonly redisRepo : RedisRepository,
        private readonly favoriteRepo : FavoriteRepository
    ){}

    async createAuction(body : CreateAuctionDto, userId : number) : Promise<CreateAuctionResponse> {
        const auction = await this.auctionRepo.createAuction(body, userId);
        console.log(`=== Create Auction ===`);
        // 만료시간 -> 남은시간 변환 (중복제거필요)
        let dbTime = auction.expiredAt;
        let nowUTC = new Date();
        let nowKST = nowUTC.getTime() + 32400000;
        const timeLeft = dbTime.getTime() - nowKST;


        await this.scheduler.addAuctionSheduleList({
            auctionId : auction.id,
            status : auction.status,
            sheduleAt : timeLeft
        });

        return {
            id : auction.id,
            title : auction.title,
            writer : auction.writer,
            minPrice : auction.minPrice,
            maxPrice : auction.maxPrice,
            createdAt : auction.createdAt,
            expiredAt : auction.expiredAt,
            thumbnail : auction.thumbnail,
        }
    }

    async getAuctions(page : number, limit : number) : Promise<GetAuctionResponse> { 
       return this.auctionRepo.getAuctionsPaging(page, limit);
    }

    async getMyAuctions(page : number, limit : number, userId : number) : Promise<GetAuctionResponse> {
        const user = await this.userRepo.getUserById(userId);
        if (!user) {
            throw new BadRequestException("USER NOT EXIST")
        }

        return this.auctionRepo.getMyAuctionsPaging(page, limit, userId);
    }

    async searchAuction(word : string, page : number, limit : number) : Promise<GetAuctionResponse> {
        return await this.auctionRepo.searchAuction(word, page, limit);
    }

    async getMyBids(page : number, limit : number, userId : number) : Promise<GetAuctionResponse> {
        const user = await this.userRepo.getUserById(userId);
        if (!user) {
            throw new BadRequestException("USER NOT EXIST")
        }
        const bidLogs = await this.bidRepo.getMyBidLogs(userId)
        const removeDuplicate = [...new Set(bidLogs)];

        return this.auctionRepo.getMyBidsPaging(page, limit, removeDuplicate);
    }

    async bid(body : BidDto, userId : number) : Promise<TransactionResponse>{
        // Auction 글 탐색
        const auction = await this.auctionRepo.getAuctionsById(body.auctionId);
        if (!auction) {
            throw new BadRequestException("AUCTION NOT EXIST");
        }

        // Auction Status 확인
        if (auction.status > 2) {
            throw new BadRequestException("AUCTION CAN NOT BID");
        }

        // Seller & Bidder 정보 및 Keystore 등록확인;
        const seller = await this.userRepo.getUserById(auction.writer);
        const bidder = await this.userRepo.getUserById(userId);
        if (!bidder.keystore) {
            throw new BadRequestException("KEYSTORE NOT EXIST");
        }

        // Bidder Password Comparison
        const pwMatch = await bcrypt.compare(body.password, bidder.password);
        if (!pwMatch) {
            throw new BadRequestException("PASSWORD NOT MATCH");
        }

        // Comparison With Bid Initial Amount
        if (Number(auction.minPrice) > body.bidAmount){
            throw new BadRequestException("PRICE NOT ENOUGH");
        }

        // Keystore Deserialize;
        const keyPair = await this.wallet.deserializaKeystore(bidder.keystore, body.password);
        
        const bidAmountToString = body.bidAmount.toString();

        // Handle Time to Unix
        const expirationDate = new Date(auction.expiredAt);
        const toUnixTimestamp = (expirationDate.getTime() / 1000) - 32400;
           
        try {
            console.log("BID");
            console.log(body.bidAmount);
            console.log(auction.maxPrice);
            // 옥션 상태 업데이트
            if (body.bidAmount >= Number(auction.maxPrice)) {
                console.log("1")
                // 즉구가 구매시 거래중 상태로 즉시전환 
                await this.auctionRepo.updateAuctionStatus(auction.id, 3);
            } else {
                console.log("2")
                // 아닐 시, 경매 지속 진행
                await this.auctionRepo.updateAuctionStatus(auction.id, 2);
            }

            // ### 이미 Auction Contract 등록이 있는가? (최초입찰) => Factory CreateAuction Contract;
            if(!auction.contract) {
                // Factory 컨트랙트 Create Auction
                const createAuctionResult = await this.contractService.factory_createAuction(
                    auction.id, 
                    auction.ipfsUrl, 
                    keyPair.privateKey, 
                    seller.publicKey, 
                    bidAmountToString,
                    auction.maxPrice,
                    toUnixTimestamp
                );

                // DB Auction에 Contract Address Update;
                const getAuctionRecordResult = await this.contractService.factory_auctionRecord(auction.id);
                const updatedAuction = await this.auctionRepo.updateAuctionContract(auction.id, getAuctionRecordResult.contractPath);
                
                // Scheduler 추가 진행
                let dbTime = auction.expiredAt;
                let nowUTC = new Date(); // -09:00 스케쥴러 시간 문제해결해야되
                let nowKST = nowUTC.getTime() + 32400000;
                const timeLeft = dbTime.getTime() - nowKST;
                
                await this.scheduler.addAuctionSheduleList({
                    auctionId : updatedAuction.id,
                    status : updatedAuction.status,
                    sheduleAt : timeLeft
                });

                // ### Create Bid Logs
                await this.bidRepo.createbidLog(body.auctionId, getAuctionRecordResult.contractPath, bidder.id, String(body.bidAmount));

                return createAuctionResult;
            }

            // ### Auction Contract 등록이 없다면 => (Auction Contract Bid 호출)
            if(auction.contract) {
                const bidResult = await this.contractService.auction_bid(
                    auction.contract,
                    keyPair.privateKey,
                    bidAmountToString
                );

                // ### Create Bid Logs
                await this.bidRepo.createbidLog(body.auctionId, auction.contract, bidder.id, String(body.bidAmount));
                
                return bidResult;
            }

  


        } catch (e) {
            throw new HttpException(e, 400);
        }
    }

    async getAuctionRecord(auctionId : number) : Promise<AuctionDetailResponse> {
        const getAuction = await  this.auctionRepo.getAuctionsById(auctionId);
        if(!getAuction){
            throw new HttpException("AUCTION NOT EXIST", 400)
        }

        const getSellerDetail = await this.userRepo.getUserById(getAuction.writer);

        return {
            id : getAuction.id,
            title : getAuction.title,
            description : getAuction.description,
            writerEoa : getSellerDetail.publicKey,
            writerEmail : getSellerDetail.email,
            writerNickname : getSellerDetail.nickname,
            status : getAuction.status,
            minPrice : getAuction.minPrice,
            maxPrice : getAuction.maxPrice,
            ipfsUrl : getAuction.ipfsUrl,
            contract : getAuction.contract,
            createdAt : getAuction.createdAt,
            expiredAt : getAuction.expiredAt
        }
    }

    async getBidders(contractAdrs : string) : Promise<GetBiddersResponse> {
        const biddersLenHex = await this.contractService.auction_biddersLength(contractAdrs);
        const biddersLenString = await biddersLenHex.toString();

        let result :{
            bidder : string;
            price : string;
            biddedAt : string;
        }[] = [];

        for (let i = 0; i < Number(biddersLenString); i++){
            const getBidders = await this.contractService.auction_bidders(contractAdrs, i);
            // Bidders = EOA Address => 이걸 닉네임으로 변경하여 출력하시오는 User Repository에서 탐색해와야함.
            const user = await this.userRepo.getUserByEoa(getBidders.bidder);

            let payload = {
                bidder : user.nickname,
                price : ethers.utils.formatEther(getBidders.price),
                biddedAt : getBidders.biddedAt.toString()
            }

            result.push(payload);
        }

        return {
            bidders : result
        };
    }

    async withdrawBySeller(body : WithdarwDto, userId : number) : Promise<TransactionResponse>{
        const auction = await this.auctionRepo.getAuctionsById(body.auctionId);
        if (!auction.contract) {
            throw new BadRequestException("AUCTION CONTRACT NOT EXIST");
        }

        if (auction.writer != userId) {
            throw new ForbiddenException("NOT SELLER");
        }

        // Auction의 Status 확인 (고객센터에 사고처리 등록된 글만 Emergency Withdraw 가능);
        if (auction.status != 4) {
            throw new BadRequestException("NOT TRADE STATUS");
        }

        const seller = await this.userRepo.getUserById(userId);
        const sellerKeyPair = await this.wallet.deserializaKeystore(seller.keystore, body.password);
        
        // Find Bidders
        const getBiddersResult = await this.getBidders(auction.contract);
        const lastBidder = getBiddersResult.bidders[getBiddersResult.bidders.length-1];

        const redisKey = `${lastBidder.bidder}_${auction.id}`;

        const redisSignedMsg = await this.redisRepo.getRedis(redisKey);
        if (!redisSignedMsg) {
            throw new BadRequestException("SIGNATURE NOT EXIST");
        }
 
        const withdrawTx = await this.contractService.auction_withdraw(
            auction.contract,
            sellerKeyPair.privateKey,
            redisSignedMsg.msgHash,
            redisSignedMsg.v,
            redisSignedMsg.r,
            redisSignedMsg.s
        )

        // DELETE REDIS SIGN
        await this.redisRepo.delRedis(redisKey);

        // Update Auction Status
        await this.auctionRepo.updateAuctionStatus(auction.id, 5);

        return withdrawTx;
    }

    async emergencyWithdraw(body : WithdarwDto, userId : number) : Promise<TransactionResponse> {
        const auction = await this.auctionRepo.getAuctionsById(body.auctionId);
        if (!auction.contract) {
            throw new BadRequestException("AUCTION CONTRACT NOT EXIST");
        }

        // Auction의 Status 확인 (고객센터에 사고처리 등록된 글만 Emergency Withdraw 가능);
        if (auction.status != 8) {
            throw new BadRequestException("AUCTION STATUS NOT MATCH");
        }

        // Find Caller & Seller & Last Bidder
        const caller = await this.userRepo.getUserById(userId);
        const seller = await this.userRepo.getUserById(auction.writer);
        const callerKeyPair = await this.wallet.deserializaKeystore(caller.keystore, body.password);
        const getbiddersResult = await this.getBidders(auction.contract);
        const lastBidder = getbiddersResult.bidders[getbiddersResult.bidders.length-1];

        // Caller 는 Last Bidder거나 판매자이어야 함. 둘다 아니라면 -> NOT AUTH
        if (caller.publicKey != lastBidder.bidder && caller.publicKey != seller.publicKey) {
            throw new ForbiddenException("UNAUTHORIZED");
        }

        // Redis에 ADMIN이 서명한 데이터 가져와.
        const admin = `0xA09d9D7e52C14DA831D1E0a559520B9D69407627`;
        const redisKey = `${admin}_${auction.id}`;
        const redisResult = await this.redisRepo.getRedis(redisKey);
        if (!redisResult) {
            throw new BadRequestException("SIGNATURE NOT EXIST");
        }

        // Send Emergency Withdraw Tx;
        const emergencyWithdrawTx = await this.contractService.auction_emergencyWithdraw(
            auction.contract,
            callerKeyPair.privateKey,
            redisResult.msgHash,
            redisResult.v,
            redisResult.r,
            redisResult.s
        )

        // Update Auction Status
        await this.auctionRepo.updateAuctionStatus(auction.id, 5);

        return emergencyWithdrawTx;
    }

    //관심상품 추가 & 삭제
    async handleFavorites(auctionId : number, userId : number) : Promise<AddFavoriteResponse>{
        // 유저 탐색
        const user = await this.userRepo.getUserById(userId);
        if (!user) {
            throw new BadRequestException("USER NOT EXIST");
        }
        
        let isExist = false;
        let favoriteToHandle : Favorite;
        let updatedUser : User;

        // 관심상품 이미 있는지 확인 [유저기준];
        user.favorites.map((item, idx)=> {
            if(item.auctuinId == auctionId) {
                favoriteToHandle = item;
                isExist = true;
            }
        })
        
        // 관심 상품이 없다면, 추가한다.
        if(!isExist) {
            const favoriteResult = await this.favoriteRepo.addFavorite(user, auctionId);
            favoriteToHandle = favoriteResult; 
            updatedUser = await this.userRepo.addUserFavorite(favoriteToHandle, user.id);
        }

        // 관심 상품이 있다면, 삭제.
        if(isExist) {
            await this.favoriteRepo.removeFavorite(favoriteToHandle);
            updatedUser = await this.userRepo.removeUserFavorite(favoriteToHandle, user.id);
        }

        return {
            userId : updatedUser.id,
            isCreated : isExist ? false : true, // 관심목로 추가했으면 true, 삭제했으면 false
        }
    }

    //관심상품 조회
    async getMyFavorites(userId : number) : Promise<GetAuctionResponse> {
        const user = await this.userRepo.getUserById(userId);
        if(!user) {
            throw new BadRequestException("USER NOT EXIST");
        }

        let favoriteAuctionIds : number[] = [];

        user.favorites.map((item, idx)=> {
            favoriteAuctionIds.push(item.auctuinId);
        })

        const myFavAuctions = await this.auctionRepo.getAuctionsByArrayIds(favoriteAuctionIds);
  
        return {
            auctions : myFavAuctions
        }
    }

    async uploadIpfs(file : any) {
        if(file.has("auction")) {
            throw new BadRequestException("ID NOT EXIST");
        }

        const auctionId = file.get("auction");

        const auction = await this.auctionRepo.getAuctionsById(Number(auctionId));

        if (!auction) {
            throw new BadRequestException("AUCTION NOT EXIST");
        }

        console.log(file);

        // const metaData = await nftStorage.store({
        //     name: "test", // Auction Title
        //     description: "test", // Auction Description
        //     image: new File([file.buffer], file.originalname, { type: file.mimetype }),
        // })

        // let metaUri = metaData.url.split("ipfs://")[1];
        
        return `https://ipfs.io/ipfs/metaUri`;
    }
}
