import { ApiProperty } from "@nestjs/swagger";


class Bidders  {
    @ApiProperty({
        description : "Bidder's eoa",
        example : "0x8bA6bE543aCc1A621a3141b7AB80bf049612CB42"
    })
    bidder : string
    @ApiProperty({
        description : "price(eth)",
        example : "0.01"
    })
    price : string
    @ApiProperty({
        description: "biddedAt(UNIX)",
        example : "1680335179"
    })
    biddedAt : string
}


export class GetBiddersResponse {
    @ApiProperty({
        description : "Auction 글",
        type: [Bidders],
    })
    bidders : Bidders[];
}

export class BidderDto {
    @ApiProperty({
        description : "contract Address",
        example : "0x96B697121754f8DAE533466FA15D5eE95a3117E2"
    })
    contractAdrs : string;
}