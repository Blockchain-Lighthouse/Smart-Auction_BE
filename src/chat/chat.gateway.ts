import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { ChatRepository } from "./chat.repository";
import { UserRepository } from "src/user/repository/user.repository";

interface CustomSocket extends Socket {
    nickname ?: string;
    userId ?: number;
}

@WebSocketGateway({
    cors: {
        origin: ["http://localhost:3000", "https://smart-auction.vercel.app"],
    }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private userRepository : UserRepository,
        private chatRepository : ChatRepository
    ) {}
    
    // 2. Socket Connected (환영인사 OK!) - ㅇㅣ거ㄴ 그그냥  접접속속
    handleConnection(@ConnectedSocket() socket : CustomSocket) {
        console.log(`Connected ! : `, socket.id);
    }

    // 3. When Socket Disconnected - 접접속 아아웃  
    handleDisconnect(@ConnectedSocket() socket : CustomSocket) {
        // Nickname & UserID 둘중하나 가져와바;
        const userId = socket.userId;
        const nickname = socket.nickname;
        console.log(`disConnected ! : `, socket.id);
        const rooms = socket.rooms;
        console.log(`USER ID : ${userId}`);
        console.log(`NICKNAME : ${nickname}`);
        console.log(rooms);

        // socket.broadcast.to(req.roomId).emit("exited", nickname);
        // await this.chatRepository.createChatLog(Number(req.roomId), userId, "BYE");
        // // Return Nickname to FE (상대)
        
        // socket.broadcast.emit("disConnected", `${socket.id}님이 접속을 종료하였습니다.`);
    }

    // 채팅방에 join
    @SubscribeMessage("join")
    async joinRoom(@MessageBody() req : { roomId : string, userId : number }, @ConnectedSocket() socket: CustomSocket) {
        console.log(`joinRoom : ${req.roomId}`);
        // 유저탐색
        const user = await this.userRepository.getUserById(req.userId);
        // 로그
        await this.chatRepository.createChatLog(Number(req.roomId), req.userId, "WELCOME");
        // 방접속
        socket.join(req.roomId);

        // Socket 객체에 프로퍼티 저장;
        socket["userId"] = user.id;
        socket["nickname"] = user.nickname;

        // Return Nickname to FE (상대)
        socket.broadcast.to(req.roomId).emit("setNickname", user.nickname);
    }

    // 채팅방에서 나가기
    @SubscribeMessage("exit")
    async exitRoom(@MessageBody() req : { roomId : string }, @ConnectedSocket() socket: CustomSocket) {
        // Nickname & UserID 둘중하나 가져와바;
        const userId = socket.userId;
        const nickname = socket.nickname;

        console.log(`${socket.id}(${nickname})님이 ${req.roomId}에서 나갔습니다.`);

        await this.chatRepository.createChatLog(Number(req.roomId), userId, "BYE");

        // Return Nickname to FE (상대)
        socket.broadcast.to(req.roomId).emit("exited", nickname);

        socket.leave(req.roomId);
    }


    @SubscribeMessage("chatting")
    async handleMessage(@MessageBody() req : { roomId : string, msg : string }, @ConnectedSocket() socket : CustomSocket){
        console.log(`MESSAGE ARRIVED (${req.roomId}) from ${socket.id}: ${req.msg}`);

        let response : {
            roomId : string,
            nickname ?: string,
            msg : string;
        } = {
            roomId : "",
            nickname : "",
            msg : "",
        };

        response.roomId = req.roomId;
        response.nickname = socket.nickname;
        response.msg = req.msg;

        const userId = socket.userId;
        // Logs
        await this.chatRepository.createChatLog(Number(req.roomId), userId, req.msg);

        // BroadCast Emit
        socket.broadcast.to(req.roomId).emit("chat", req.msg);

        return response;
    }
}