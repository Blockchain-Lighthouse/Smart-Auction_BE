import { HttpException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Auction } from "src/entities/auction.entity";
import { DataSource, In, Repository } from "typeorm";
import { CreateAuctionDto } from "../dto/createAuctionDto";
import { GetAuctionResponse } from "../dto/getAuctionDto";


@Injectable()
export class AuctionRepository extends Repository<Auction> {
    constructor(
        private readonly data : DataSource,
    ){
        super(Auction, data.createEntityManager());
    }

    async createAuction(body : CreateAuctionDto, userId : number) : Promise<Auction>{
        try {
            const creationObj = await this.create({
                title : body.title,
                description : body.description,
                minPrice : body.minPrice,
                maxPrice : body.maxPrice,
                ipfsUrl : body.ipfsUrl,
                expiredAt : body.expiredAt,
                writer : userId,
                thumbnail : body.thumbnail,
                status : 1,
            })

            const result = await this.save(creationObj);
            return result;
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

    async updateAuctionContract(auctionId : number, contractAdrs : string) : Promise<Auction> {
        try {
            const auctionToUpdate = await this.findOneBy({
                id : auctionId
            })

            auctionToUpdate.contract = contractAdrs;

            await this.save(auctionToUpdate);

            return auctionToUpdate;
        } catch (e) {
            throw new HttpException(e, 400);
        }
    }

    async updateAuctionStatus(auctionId : number, status : number) : Promise<Auction> {
        try {
            const auctionToUpdate = await this.findOneBy({
                id : auctionId
            })

            auctionToUpdate.status = status;

            this.save(auctionToUpdate);

            return auctionToUpdate;
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

    async getAuctionsPaging(page : number, limit : number) : Promise<GetAuctionResponse>{
        try {
            const result = await this.findAndCount({
                take : limit,
                skip : limit * (page - 1),
                order : {
                    createdAt : "DESC",
                }
            });
            const auctions = result[0];
            const totalAuctionCount = result[1];
    
            return {
                auctions,
                total : totalAuctionCount
            };
        } catch (e) {
            throw new HttpException(e, 400);
        }
    }

    async getMyAuctionsPaging(page : number, limit : number, userId : number) : Promise<GetAuctionResponse>{
        try {
            const result = await this.find({
                where : {writer : In([userId])}, 
                take : limit,
                skip : limit * (page - 1),
                order : {
                    createdAt : "DESC",
                }
            });
            return {
                auctions : result
            };
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

    async getMyBidsPaging(page : number, limit : number, AuctionId : number[]) : Promise<GetAuctionResponse>{
        try {
            const result = await this.find({
                where : {id : In(AuctionId)}, 
                take : limit,
                skip : limit * (page - 1),
                order : {
                    createdAt : "DESC",
                }
            });
    
            return {
                auctions : result
            };
        } catch(e) {
            throw new HttpException(e, 400);
        }

    }

    async getAuctionsById(id : number) : Promise<Auction> {
        try {
            const result = await this.findOneBy({
                id,
            })

            return result;
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

    async getAuctionsByArrayIds(ids : number[]) : Promise<Auction[]> {
        try {
            const result = await this.find({
                where : {id : In(ids)}, 
            })

            return result;
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

    async getActivatedAuction() : Promise<Auction[]> {
        try {
            const result = await this.findBy({
                status : In([2, 3])
            })

            return result;
        } catch (e) {
            throw new HttpException(e, 400);
        }
    }

    async getBidderRecuritingAuction() : Promise<Auction[]> {
        try {
            const result = await this.findBy({
                status : In([1, 2])
            })

            return result;
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }

    async searchAuction(word : string, page : number, limit : number) : Promise<GetAuctionResponse> {
        try {
            const queryResult = await this
                .createQueryBuilder('auctions')
                .where('auctions.title LIKE :query OR auctions.description LIKE :query', {
                    query : `%${word}%`,
                    take : limit,
                    skip : limit * (page - 1),
                    order : {
                        createdAt : "DESC",
                    }
                })
                .getManyAndCount()
            
            let response : GetAuctionResponse = {
                auctions : queryResult[0],
                total : queryResult[1],
            }

            return response;
        } catch(e) {
            throw new HttpException(e, 400);
        }

    }
}
