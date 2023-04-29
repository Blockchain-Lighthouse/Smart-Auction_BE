import { HttpException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { DataSource, In, Repository } from "typeorm";
import { BidLogs } from "src/entities/bidLog.entity";

@Injectable()
export class BidRepository extends Repository<BidLogs> {
    constructor(
        private readonly data : DataSource,
    ){
        super(BidLogs, data.createEntityManager());
    }

    async createbidLog(
        auctionId : number, 
        auctionContract : string, 
        bidder : number, 
        price : string
    ) : Promise<BidLogs> {
        try {
            const bidLogObject = await this.create({
                auctionId,
                auctionContract,
                bidder,
                price,
            })

            const result = await this.save(bidLogObject);
            return result;
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

    async getMyBidLogs(userId : number) : Promise<number[]> {
        try {
            const bidlogs = await this.find({
                where : {bidder : In([userId])}, 
                select : {
                    auctionId : true
                }
            })

            let result : number[] = [];

            bidlogs.map((item, idx) => {
                result.push(item.auctionId)
            })
            
            return result;
        } catch (e) {
            throw new HttpException(e, 400);
        }
    }
}