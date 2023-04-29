import { ApiProperty, PickType } from "@nestjs/swagger";
import { User } from "src/entities/user.entity";

export class AuthResponse extends PickType (User, [
    'id', 
    'email', 
    'nickname', 
    'publicKey', 
    'role', 
    'registeredAt', 
    'updatedAt'
    ],  
    ) {
    @ApiProperty({
        example : "0.5",
        description : "유저잔고",
        required: true
    })
    balance : string;
}