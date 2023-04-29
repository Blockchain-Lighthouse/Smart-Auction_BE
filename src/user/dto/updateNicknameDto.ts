import { ApiProperty, PickType } from "@nestjs/swagger";
import {IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { User } from "src/entities/user.entity";


export class UpdateNicknameDto extends PickType(User, [
    "nickname"
]){}

export class UpdateNicknameResponse {
    @ApiProperty({
        example : 1,
    })
    userId : number;
}