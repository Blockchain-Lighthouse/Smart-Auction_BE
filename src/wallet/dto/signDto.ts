import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class SignDto {
    @ApiProperty({
        example : "aSecret!3",
        description : "password - Min=6 Max=20",
        required: true
    })
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    password : string;

    @ApiProperty({
        example : 11,
        description : "Auction ID",
        required: true
    })
    @IsNotEmpty()
    auctionId : number;

    @ApiProperty({
        example : "0x8bA6bE543aCc1A621a3141b7AB80bf049612CB42",
        description : "출금을 허용할 EOA 주소",
    })
    signMsg : string;
}

export class SignResponse {
    @ApiProperty({
        example : "0x8bA6bE543aCc1A621a3141b7AB80bf049612CB42",
        description : "Signed User EOA",
        required: true
    })
    signedBy : string;
}

