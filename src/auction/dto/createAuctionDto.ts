import { PickType } from "@nestjs/swagger";
import { Auction } from "src/entities/auction.entity";

export class CreateAuctionDto extends PickType (
    Auction, [
        "title", 
        "description", 
        "minPrice",
        "maxPrice",
        "ipfsUrl",
        "expiredAt",
        "thumbnail"
    ]
){}

export class CreateAuctionResponse extends PickType (
    Auction, [
        "id", 
        "title", 
        "writer", 
        "minPrice",
        "maxPrice",
        "createdAt",
        "expiredAt",
        "thumbnail"
    ]
){}