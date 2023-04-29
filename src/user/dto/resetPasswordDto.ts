import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { User } from "src/entities/user.entity";

export class SendResetPasswordEmailDto extends PickType (User, [
    'email'
]
) {}

export class SendResetPasswordEmailResponse {
    @ApiProperty({
        description : "resetToken", 
        example : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6MCwiaWF0IjoxNjc5NzI4OTEwLCJleHAiOjE2Nzk3MjkyMTB9.Lh7uH0PfmTCqwfyO3Q_1cdozpjL3HOcn0sO9LokSbbc"
    })
    resetToken : string;

    @ApiProperty({
        description : "resetTokenExpiredAt", 
        example : 1679734047 
    })
    expiredAt : number;
}

// resetToken 받고 -> 토큰에서 User를 꺼내오고
// 새 패스워드 받고
// Mnemonic 받고 -> 새 패스워드로 새로운 Keystore 생성 저장
// 패스워드 Bcrypt로 암호화해서 저장.
export class VerifyResetPasswordEmail {
    @ApiProperty({
        example : "aSecret!3",
        description : "password",
        required: true
    })
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    password : string;

    @ApiProperty({
        example : "budget unhappy snap elephant include game undo blue circle bar cushion random",
        description : "Mnemonic Pharse",
        required: true
    })
    mnemonic : string;
}

export class VerifyResetPasswordResponse {
    @ApiProperty({
        example : 1,
        description : "UserId",
        required: true
    })
    userId : number;
}