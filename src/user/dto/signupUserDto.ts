import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { User } from "src/entities/user.entity";

export class SignUpUserDto extends PickType(User, [
    "email",
    "password",
    "nickname"
]){}

export class SignUpUserResponse extends PickType (
    User, [
        'id', 
        'email'
    ],
) {}


export class ResendEmailResponse {
    @ApiProperty({
        description : "email", 
        example : "lighthouse@naver.com" 
    })
    email : string
    @ApiProperty({
        description : "code", 
        example : "975120" 
    })
    code : string
}