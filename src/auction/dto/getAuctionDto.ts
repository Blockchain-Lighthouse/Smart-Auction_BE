import { ApiProperty, PickType } from "@nestjs/swagger";
import { Auction } from "src/entities/auction.entity";

export class GetAuctionResponse {
    @ApiProperty({
        description : "Auction 글",
        type: [Auction],
    })
    auctions : Auction[];
    
    @ApiProperty({
        example : 3,
        description : "총 글 갯수",
    })
    total ?: number;
}

export class AuctionDetailResponse extends PickType(Auction, [
    "id",
    "title",
    "description",
    "status",
    "minPrice",
    "maxPrice",
    "contract",
    "ipfsUrl",
    "createdAt",
    "expiredAt"
]){
    @ApiProperty({
        description: "판매자 EOA",
        example : "0x8bA6bE543aCc1A621a3141b7AB80bf049612CB42"
    })
    writerEoa : string;

    @ApiProperty({
        description : "판매자 이메일주소",
        example : "lighthouse2023@naver.com"
    })
    writerEmail : string;

    @ApiProperty({
        description : "닉네임",
        example : "blockmonkey"
    })
    writerNickname : string;
}