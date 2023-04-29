import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity, Column, Entity, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Favorite } from "./favorite.entity";
import { MaxLength, MinLength } from "class-validator";

@Entity({ 
    name : "users" 
})
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    @ApiProperty({
        example : 1,
        description : "id",
    })
    id: number;

    @ApiProperty({
        example : "lighthouse@naver.com",
        description : "email - Min=5 Max=50",
    })
    @Column({ nullable: false, unique : true})
    email : string;

    @ApiProperty({
        example : "123456",
        description : "password Min=6 Max = 12",
    })
    @MinLength(6)
    @MaxLength(20)
    @Column({ nullable : false })
    password : string;

    @ApiProperty({
        example : "Keystore Value",
        description : "Keystore",
    })
    @Column("varchar", { 
        length : 1000, 
        nullable: true, 
        unique: true 
    })
    keystore : string;

    @Column({ unique : true, nullable: true })
    publicKey : string;

    @ApiProperty({
        example : "Blockmonkey",
        description : "Nickname",
    })
    @Column({ nullable : true, unique : true })
    nickname : string;

    @ApiProperty({
        example : "www.aws.s3/thumbnailImage",
        description : "프로필 이미지 URL",
    })
    @Column({ nullable : true })
    profile : string;
 
    @ApiProperty({
        example : 1,
        description : "유저권한 0 = 이메일 비인증 유저 1 = 이메일 인증 유저 2 = 지갑 등록 유저 9 = 어드민",
    })
    @Column({ nullable : false, default : () => 0 })
    role : number;

    @ApiProperty({
        example : "2023-03-24 23:19:46.6",
        description : "유저 생성 시각",
    })
    @CreateDateColumn()
    registeredAt: Date;

    @ApiProperty({
        example : "2023-03-24 23:19:46.6",
        description : "유저 정보 업데이트 시각",
    })
    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Favorite, (favorite) => favorite.user)
    favorites: Favorite[];
}
