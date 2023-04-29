import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatRepository } from './chat.repository';
import { UserRepository } from 'src/user/repository/user.repository';
import { UserModule } from 'src/user/user.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';


@Module({
  imports : [
    UserModule,
  ],
  providers: [ChatGateway, ChatRepository, ChatService],
  controllers: [ChatController]
})

export class ChatModule {}
