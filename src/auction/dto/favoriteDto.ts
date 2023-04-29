import { ApiProperty } from "@nestjs/swagger";
import { Favorite } from "src/entities/favorite.entity";

export class FavoriteDto {
    @ApiProperty({
        example : 1,
        description : "Auction Id",
        required: true
    })
    auctionId : number;
}

export class AddFavoriteResponse {
    @ApiProperty({
        example : 1,
    })
    userId : number;

    @ApiProperty({
        example : true,
    })
    isCreated : boolean;
}