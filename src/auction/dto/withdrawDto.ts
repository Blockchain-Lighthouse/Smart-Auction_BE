import { ApiProperty } from "@nestjs/swagger";

export class WithdarwDto {
    @ApiProperty({
        example : "!Secret",
        description : "비밀번호",
    })
    password : string;

    @ApiProperty({
        example : 11,
        description : "옥션 글 ID",
    })
    auctionId : number;
}