import { BadRequestException, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import { CONTRACT_AUCTION, CONTRACT_FACTORY } from '../abi/contract';
import { AuctionRepository } from 'src/auction/repository/auction.repository';
import { BidRepository } from 'src/auction/repository/bid.repository';
import { UserRepository } from 'src/user/repository/user.repository';

@Injectable()
export class ContractService {
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

    private factoryContract;

    /**
     * Factory Contract - Admin
    */
    async factory_admin() {
        const factoryContract = await new ethers.Contract(CONTRACT_FACTORY.address, CONTRACT_FACTORY.abi, this.provider);
        return await factoryContract.functions.admin();
    }

    /**
     * Factory Contract - createAuction
     * @param {number} auctionId AUCTION ID
     * @param {string} ipfsUrl IPFS URL
     * @param {string} privateKey PRIVATE KEY WHICH IS DESERIALIZE FROM KEYSTORE
     * @param {string} sellerAddress 판매자 Address
     * @param {string} value 최초 입찰 금액
     * @param {number} expirationUnix (OPTIONAL) 유효시간 설정 (ex > 3600 = 1시간 후) DEFAULT=25920301 (30Days);
     * @param {string} maxPrice 즉구가
     */
    async factory_createAuction(
        auctionId : number,
        ipfsUrl : string,
        privateKey : string,
        sellerAddress : string,
        value : string,
        maxPrice ?: string,
        expirationUnix ?: number,
    ) : Promise<{
        to : string,
        from : string,
        gasUsed : string,
        blockHash : string,
        transactionHash : string
    }> {
        const signer = new ethers.Wallet(privateKey, this.provider);
        const maxDefault = 99 * (10**18);
        const expirationUnixDefault = 9999999999;
        const amount = await ethers.utils.parseEther(value);
        const convertMaxPrice = await ethers.utils.parseEther(maxPrice);

        // 정적 호출 컨트렉트 에러체크
        try {
            // EST GAS
            const estimateGasLimit = await this.factoryContract.connect(signer).estimateGas.createAuction(
                auctionId, 
                ipfsUrl, 
                sellerAddress,        
                convertMaxPrice ? convertMaxPrice : maxDefault,
                expirationUnix ? expirationUnix : expirationUnixDefault,
                { value : amount }
            );

            // STATIC CALL
            await this.factoryContract.connect(signer).callStatic.createAuction(
                auctionId, 
                ipfsUrl, 
                sellerAddress,        
                convertMaxPrice ? convertMaxPrice : maxDefault,
                expirationUnix ? expirationUnix : expirationUnixDefault,
                { value : amount }                
            );

            // CONTRACT SEND TX
            const createAuctionTx = await this.factoryContract.connect(signer).functions.createAuction(
                auctionId, 
                ipfsUrl, 
                sellerAddress, 
                convertMaxPrice ? convertMaxPrice : maxDefault,
                expirationUnix ? expirationUnix : expirationUnixDefault,
                { 
                    value : amount,
                    gasLimit : estimateGasLimit
                }
            );
        
            const receipt = await createAuctionTx.wait();

            return {
                to : receipt.to,
                from : receipt.from,
                gasUsed : receipt.gasUsed.toString(),
                blockHash : receipt.blockHash,
                transactionHash : receipt.transactionHash
            };
        } catch(e) {
            throw new BadRequestException(e);
        }
    }

    /**
     * Factory Contract - auctionRecord
     * @param {number} auctionId AUCTION ID
     */
    async factory_auctionRecord(
        auctionId : number
    ) : Promise<{
        auctionId : number;
        contractPath : string;
        ipfsPath : string;
        seller : string;
        initPrice : string;
        timestamp : number;
    }>{ 
        const result = await this.factoryContract.functions.auctionRecord(auctionId);
        console.log("RESULT ==");

        return {
            auctionId : result[0].toNumber(),
            contractPath : result[1],
            ipfsPath : result[2],
            seller : result[3],
            initPrice : result[4].toString(),
            timestamp : result[5].toNumber()
        };
    }
    
    /**
     * Auction Contract - bid
     * @param {string} contractAdrs Auction Contract Address
     * @param {string} privateKey PRIVATE KEY WHICH IS DESERIALIZE FROM KEYSTORE
     * @param {string} value 입찰 금액
     */
    async auction_bid(contractAdrs : string, privateKey : string, value : string) : Promise<{
        to : string,
        from : string,
        gasUsed : string,
        blockHash : string,
        transactionHash : string
    }>{
        // Signer
        const signer = new ethers.Wallet(privateKey, this.provider);
        const amount = await ethers.utils.parseEther(value);

        // Auction Contract
        const auctionContract = new ethers.Contract(
            contractAdrs, 
            CONTRACT_AUCTION.abi, 
            signer
        );

        // 정적 호출 컨트렉트 에러체크
        try {
            // EST GAS
            const estimateGasLimit = await auctionContract.connect(signer).estimateGas.bid({ value : amount });
   
            await auctionContract.connect(signer).callStatic.bid({ value : amount })

            // 컨트랙트 호출
            const createAuctionTx = await auctionContract.connect(signer).functions.bid(
                { 
                    value : amount,
                    gasLimit : estimateGasLimit
                }
            );
        
            const receipt = await createAuctionTx.wait();

            return {
                to : receipt.to,
                from : receipt.from,
                gasUsed : receipt.gasUsed.toString(),
                blockHash : receipt.blockHash,
                transactionHash : receipt.transactionHash
            };
        } catch(e) {
            throw new BadRequestException(e);
        }
    }

    /**
     * Auction Contract - withdraw
     * @param {string} contractAdrs Auction Contract Address
     * @param {string} privateKey PRIVATE KEY WHICH IS DESERIALIZE FROM KEYSTORE
     * @param {string} msgHash Message Hash
     * @param {number} v Signature v
     * @param {string} r Signature r
     * @param {string} s Signature s
     */
    async auction_withdraw(contractAdrs : string, privateKey : string, msgHash : string, v : number, r : string, s : string) : Promise<{
        to : string,
        from : string,
        gasUsed : string,
        blockHash : string,
        transactionHash : string
    }>{
        // Signer
        const signer = new ethers.Wallet(privateKey, this.provider);

        // Auction Contract
        const auctionContract = new ethers.Contract(
            contractAdrs, 
            CONTRACT_AUCTION.abi, 
            signer
        );



        // 정적 호출 컨트렉트 에러체크
        try {
            // EST GAS
            const estimateGasLimit = await auctionContract.connect(signer).estimateGas.withdraw(
                msgHash,
                v,
                r,
                s
            );

            await auctionContract.connect(signer).callStatic.withdraw(
                msgHash,
                v,
                r,
                s
            );

            // Call Bid
            const tx = await auctionContract.connect(signer).functions.withdraw(
                msgHash,
                v,
                r,
                s,
                {
                    gasLimit : estimateGasLimit
                }
            );
            
            const receipt = await tx.wait();

            return {
                to : receipt.to,
                from : receipt.from,
                gasUsed : receipt.gasUsed.toString(),
                blockHash : receipt.blockHash,
                transactionHash : receipt.transactionHash
            };
        } catch(e) {
            throw new BadRequestException(e);
        }
    }

    /**
     * Auction Contract - emergency Withdraw
     * @param {string} contractAdrs Auction Contract Address
     * @param {string} privateKey PRIVATE KEY WHICH IS DESERIALIZE FROM KEYSTORE
     * @param {string} msgHash Message Hash
     * @param {number} v Signature v
     * @param {string} r Signature r
     * @param {string} s Signature s
     */
    async auction_emergencyWithdraw(contractAdrs : string, privateKey : string, msgHash : string, v : number, r : string, s : string) : Promise<{
        to : string,
        from : string,
        gasUsed : string,
        blockHash : string,
        transactionHash : string
    }>{
        // Signer
        const signer = new ethers.Wallet(privateKey, this.provider);

        // 정적 호출 컨트렉트 에러체크
        try {
            // Auction Contract
            const auctionContract = new ethers.Contract(
                contractAdrs,
                CONTRACT_AUCTION.abi,
                signer
            );

            // EST GAS
            const estimateGasLimit = await auctionContract.connect(signer).estimateGas.emergencyWithdraw(
                msgHash,
                v,
                r,
                s
            );
            await auctionContract.connect(signer).callStatic.emergencyWithdraw(
                msgHash,
                v,
                r,
                s
            );

            // Call Bid
            const tx = await auctionContract.connect(signer).functions.emergencyWithdraw(
                msgHash,
                v,
                r,
                s,
                {
                    gasLimit : estimateGasLimit
                }
            );
            
            const receipt = await tx.wait();

            return {
                to : receipt.to,
                from : receipt.from,
                gasUsed : receipt.gasUsed.toString(),
                blockHash : receipt.blockHash,
                transactionHash : receipt.transactionHash
            };
        } catch(e) {
            throw new BadRequestException(e);
        }
    }

    /**
     * Auction Contract - biddersLength
     * @param {string} contractAdrs Auction Contract Address
     */
    async auction_biddersLength(contractAdrs : string) {
        const auctionContract = await new ethers.Contract(contractAdrs, CONTRACT_AUCTION.abi, this.provider);
        return await auctionContract.functions.biddersLength();
    }

    /**
     * Auction Contract - bidders
     * @param {string} contractAdrs Auction Contract Address
     * @param {number} index Bidder`s Array Index
     */
    async auction_bidders(contractAdrs : string, index : number) {
        const auctionContract = await new ethers.Contract(contractAdrs, CONTRACT_AUCTION.abi, this.provider);
        return await auctionContract.functions.bidders(index);
    }


    /**
     * Events
     */
    async factory_createAuctionEvent() {
        await this.factoryContract.on('AuctionCreated', async(auctionId, auctionContract, caller, price, occurredAt, event) => {
            console.log(`Auction Created EVENT 발생!`,)
            // Create Bid Logs            
            const bidder = await this.userRepo.getUserByEoa(caller);
            await this.bidRepo.createbidLog(auctionId.toNumber(), auctionContract, bidder.id, price.toString());

            // 즉구처리
            // 즉구가가 입입력력되되었었다다면 Auction Status 변경 =>
            const auction = await this.auctionRepo.getAuctionsById(auctionId.toNumber());

            console.log('=== price ===');
            console.log(price);
            const etherValue = ethers.utils.formatEther(price);

            console.log(etherValue);
            if(auction.maxPrice == etherValue) {
                // Auction Status => 3
                await this.auctionRepo.updateAuctionStatus(auctionId.toNumber(), 3);
            } else {
                await this.auctionRepo.updateAuctionStatus(auctionId.toNumber(), 2);
            }
 
            // Auction Event 갱신
            await this.auction_event();
        });
    }

    async auction_event() {
        // Auction 글 중 현재 활성화 되어있는 글만 탐색
        const activatedAuction = await this.auctionRepo.getActivatedAuction();
        console.log(`=== activatedAuction ===`);
        // 해당 글에 대하여 Contract Event Listening On
        let addresses : string[] = [];


        for (let i=0; i < activatedAuction?.length; i++) {
            if(activatedAuction[i].contract) {
                await addresses.push(activatedAuction[i].contract);
            }
        }
        
        for (let i=0; i < addresses?.length; i++) {
            const auctionContract = await new ethers.Contract(
                addresses[i], 
                CONTRACT_AUCTION.abi, 
                this.provider
            )
            // Create Auction 이후 입찰발생
            auctionContract.on("Bid", async(auctionId, auctionContract, caller, price, occuredAt, event) => {
                console.log(`AUCTION BID EVENT 발생!`)
                // Create Bid Logs            
                const bidder = await this.userRepo.getUserByEoa(caller);
                await this.bidRepo.createbidLog(auctionId.toNumber(), auctionContract, bidder.id, price.toString());

                // 즉구처리
                // 즉구가가 입입력력되되었었다다면 Auction Status 변경 =>
                const auction = await this.auctionRepo.getAuctionsById(auctionId.toNumber());
                const etherValue = ethers.utils.formatEther(price);
                if(auction.maxPrice == etherValue) {
                    // Auction Status => 3
                    await this.auctionRepo.updateAuctionStatus(auctionId, 3);
                }
            })

            // // Auction 출금 발생
            // auctionContract.on("Withdrawal", async(auctionId, auctionContract, caller, price, occuredAt, event) => {
            //     console.log(`AUCTION WITHDRAWAL EVENT 발생!`)
            //     // DB 해당 글 데이터베이스 Status Update할 것. => 4 거래종료 상태
            //     await this.auctionRepo.updateAuctionStatus(auctionId.toNumber(), 5);
            // })
        }
    }
}
