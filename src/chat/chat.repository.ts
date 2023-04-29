
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { AuctionChat } from "src/entities/auction_chat.entity";
import { User } from "src/entities/user.entity";
import { DataSource, Repository } from "typeorm";


@Injectable()
export class ChatRepository extends Repository<AuctionChat> {
    constructor(
        private data : DataSource,
    ) {
        // 상위클래스 Repository 초기화; (targetEntity, manager: EntityManager, queryRunner?: QueryRunner)
        super(AuctionChat, data.createEntityManager());
    }
    // Create ChatLogs
    async createChatLog(roomId : number, senderId : number, content : string) : Promise<AuctionChat>{
        try {
            const tx = await this.create({
                roomId,
                senderId,
                content,
            })

            await this.save(tx);
            return tx;
        } catch (e) {
            console.log(e);
            if (e.code === "ER_DUP_ENTRY") {
                throw new BadRequestException(e);
            } else {
                throw new InternalServerErrorException();
            }
        }
    }

    async getChatLogsByRoomId(roomId : number) : Promise<AuctionChat[]>{
        try {
            const chatLogs = await this.findBy({
                roomId : roomId,
            })
            return chatLogs;
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }
}