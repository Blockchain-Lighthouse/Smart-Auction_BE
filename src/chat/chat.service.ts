import { Injectable } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { AuctionChat } from 'src/entities/auction_chat.entity';

@Injectable()
export class ChatService {
    constructor(
        private readonly chatRepository : ChatRepository
    ){}
    
    async getChatLogsByAuctionId(auctionId : number) : Promise<AuctionChat[]>{
        return await this.chatRepository.getChatLogsByRoomId(auctionId);
    }
}
