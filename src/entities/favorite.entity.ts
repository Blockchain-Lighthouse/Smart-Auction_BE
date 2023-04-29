import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ 
    name : "favorites" 
})
export class Favorite extends BaseEntity {
    @ApiProperty({
        example : 13,
        description : "PK",
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.favorites , {nullable : false})
    user: User;

    @ApiProperty({
        example : 7,
        description : "Favorite Added Auction ID",
    })
    @Column({ nullable : false })
    auctuinId : number;

    @CreateDateColumn()
    @ApiProperty({
        example : `2023-03-28T13:08:45.460Z`,
        description : "생성일",
    })
    createdAt: Date;
}
