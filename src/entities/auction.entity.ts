import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity, Column, Entity, CreateDateColumn, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";
// import { Chat } from "./chat.entity";

@Entity({ 
    name : "auctions" 
})
export class Auction extends BaseEntity {
    @PrimaryGeneratedColumn()
    @ApiProperty({
        example : 1,
        description : "id",
    })
    id: number;

    @Column()
    @ApiProperty({
        example : "아이폰 팔아여~",
        description : "Auction 글 제목",
    })
    title : string;

    @Column("varchar" ,{ length : 3000 })
    @ApiProperty({
        example : "아이폰 팔아여~ 제 아이폰은 ...",
        description : "Auction 글 본문",
    })
    description : string;

    @Column()
    @ApiProperty({
        example : 1,
        description : "작성자 ID",
    })
    writer : number;

    @Column({ nullable : false })
    @ApiProperty({
        example : 1,
        description : `
        1 = 글 등록 & 경매 진행중 상태
        2 = 최초 입찰자 발생한 상태
        3 = 최종 낙찰자와 거래 진행중 && MAX PRICE 도달|| MAX AGE 도달
        4 = 최종 입찰자의 서명 완료상태 (서명이 있는상태)
        5 = 경매 종료 (Withdraw 완료상태)
        6 = 글 비활성화 (MAX AGE 도달했으나 입찰자가 없는 상태)
        8 = 경매 사고 처리 대기 비활성화 글 (사고접수상태)
        `,
    })
    status : number;

    @Column()
    @ApiProperty({
        example : `500`,
        description : "경매 시작가",
    })
    minPrice : string;

    @Column({ nullable: true })
    @ApiProperty({
        example : `1500`,
        description : "경매 최대가 (이 가격 입찰이 오면 즉시 낙찰됨)",
    })
    maxPrice : string;

    @Column({ nullable: true })
    @ApiProperty({
        example : `0xabc`,
        description : "입찰자 발생 시 컨트랙트가 생성되고 해당 컨트랙트 주소",
    })
    contract : string;

    @Column({ nullable: true })
    @ApiProperty({
        example : `ipfs://navkjdnvk.j`,
        description : "경매 글 정보 IPFS Uploaded URL",
    })
    ipfsUrl : string;

    @Column()
    @ApiProperty({
        example : `www.aws.s3/thumbnailImage`,
        description : "썸네일 이미지",
    })
    thumbnail : string;

    @CreateDateColumn()
    @ApiProperty({
        example : `2023-03-28T13:08:45.460Z`,
        description : "생성일",
    })
    createdAt: Date;

    @Column({ type: "datetime", default: () => `DATE_ADD(NOW(), INTERVAL 7 DAY)` })
    @ApiProperty({
        example : `2023-03-28T13:08:45.460Z`,
        description : "경매 종료 시각",
    })
    expiredAt: Date;

    // @OneToMany(()=> Chat, chat => chat.auction)
    // chats : Chat[];
}
