import { Injectable, OnModuleInit } from "@nestjs/common";
import { AuctionRepository } from "../repository/auction.repository";

interface auctions {
    auctionId : number,
    sheduleAt : number, //오타수정해야함
    status : number,
}

@Injectable()
export class Scheduler implements OnModuleInit{
    constructor(
        public readonly auctionRepo : AuctionRepository
    ){}

    // Module 초기화시 실행.
    async onModuleInit() {
        const auction = await this.auctionRepo.getBidderRecuritingAuction();
        let payload : {
            auctionId : number,
            sheduleAt : number,
            status : number,
        }[] = [];

        auction.map(async(item, idx) => {
            // 만료시간 -> 남은시간 변환
            let dbTime = item.expiredAt;
            let now = new Date();
            const timeLeft = dbTime.getTime() - now.getTime();

            // 서버가 종료된 동안 시간이 이미 만료된것 체크
            if (0 > timeLeft) {
                //입찰자가 없다면, 경매 비활성화
                if (item.status === 1) {
                    await this.auctionRepo.updateAuctionStatus(item.id, 5);
                }
                // 입찰자가 있는경우 거래상태로 전환
                if (item.status === 2) {
                    await this.auctionRepo.updateAuctionStatus(item.id, 3);
                }
            } else {
                payload.push({
                    auctionId : item.id,
                    sheduleAt : timeLeft,
                    status : item.status,
                })
            }
        })
        // DB Time => 현재시간에서 남은시간 (초)로 구하시오.
        this.init(payload);
    }

    auction : auctions[] = [];
    scheduleList = [];

    // Auction 초기화
    async init(initAuction : auctions[]) {
        // DATE받아서 남은시간으로 NUMBER 변환해서 아래에 넣으시오.
        initAuction.map((item, idx) => {
            this.auction.push(item);
        })
        this.start();
    }

    // 서버 실행 시, 스케쥴러 시작
    start() {
        // Clear Time Out
        this.scheduleList.map((item, idx)=> {
            clearTimeout(item);
        })

        this.scheduleList = [];
        
        // Set Time out
        this.auction.map((item, idx)=> {
            const id = setTimeout(() => {
                this.handleAuctionEnd(item.auctionId, item.status);
            }, item.sheduleAt);

            this.scheduleList.push(id);
        })
    }

    // Auction 종료 기능
    async handleAuctionEnd(auctionId : number, status : number) {        //입찰자가 없다면, 경매 비활성화
        if (status === 1) {
            await this.auctionRepo.updateAuctionStatus(auctionId, 6);
        }

        // 입찰자가 있는경우 거래상태로 전환
        if (status === 2) {
            await this.auctionRepo.updateAuctionStatus(auctionId, 3);
        }

        // 스케쥴이 끝났다면 옥션 정보 비워줘야함
        this.auction.map((item, idx)=> {
            if(item.auctionId === auctionId) {
                this.auction.splice(idx, 1);
            }
        })

        this.start();
    }

    // AddAuctionList
    async addAuctionSheduleList(newAuction : auctions) {
        // Auction List에 이미 존재하는가 ?
        let isExist = false;
        
        this.auction.map((item, idx)=> {
            if (item.auctionId == newAuction.auctionId) {
                isExist = true;
                this.auction[idx] = newAuction;
            }
        })

        // 없다면, push해야되
        if(!isExist) {
            this.auction.push(newAuction);
        }

        this.start();

        console.log(`CURRENT AUCTION SCHEDULED LIST`);
        console.log(this.auction);
    }
}
