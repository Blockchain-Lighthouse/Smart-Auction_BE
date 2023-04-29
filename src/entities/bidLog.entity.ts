import { BaseEntity, Column, Entity, CreateDateColumn, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";


@Entity({ 
    name : "bid_logs" 
})
export class BidLogs extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    auctionId : number;

    @Column()
    auctionContract : string;

    @Column()
    bidder : number;

    @Column()
    price : string;

    @CreateDateColumn()
    biddedAt : Date;
}
