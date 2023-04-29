import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity, Column, Entity, CreateDateColumn, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";

@Entity({ 
    name : "bid_logs" 
})
export class BidLogs extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @ApiProperty({
        example : 13,
        description : "PK",
    })
    auctionId : number;

    @Column()
    @ApiProperty({
        example : "0x1x213xfxx45435x345x1",
        description : "Auction 컨트랙트주소 (입찰시 생성)",
    })
    auctionContract : string;

    @Column()
    @ApiProperty({
        example : 1,
        description : "입찰자 ID",
    })
    bidder : number;

    @Column()
    @ApiProperty({
        example : "0.5",
        description : "입찰금액",
    })
    price : string;

    @CreateDateColumn()
    @ApiProperty({
        example : `2023-03-28T13:08:45.460Z`,
        description : "입찰시각",
    })
    biddedAt : Date;
}
