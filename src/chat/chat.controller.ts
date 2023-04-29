import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/common/customApiResponse.decorator';


@Controller('chats')
@ApiTags('채팅 API') // Swagger Tage 설정
export class ChatController {
    constructor(
        private readonly chatService : ChatService
    ){}

    @ApiOperation({ summary : "채팅조회" })
    @ApiParam({ name : "id" })
    @Get("/:id")
    async getUser(@Param("id") id) {
        return await this.chatService.getChatLogsByAuctionId(id);
    }
}
