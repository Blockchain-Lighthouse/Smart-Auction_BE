import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class BidDto {
    @ApiProperty({
        example : 1,
        required: true,
    })
    auctionId : number;

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
        example : "0.3",
        description : "MATIC Amount",
        required: true
    })
    @IsNotEmpty()
    bidAmount : number;
}