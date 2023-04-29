import { BaseEntity, Column, Entity, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({ 
    name : "auction_chats" 
})
export class AuctionChat extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column() //It Will Same with Auction Id
    roomId : number;

    @Column()
    senderId : number;

    @Column()
    content : string;

    @CreateDateColumn()
    createdAt : Date;
}
