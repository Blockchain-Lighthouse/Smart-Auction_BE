import { ApiProperty, PickType } from "@nestjs/swagger";
import { User } from "src/entities/user.entity";

export class VerifySignUpDto {
    @ApiProperty({
        example : "975120",
        description : "회원가입 인증코드",
        required: true
    })
    verificationCode : string;
}

export class VerifySignUpResponse extends PickType (User, [
    'id', 
    'role'
],
){}