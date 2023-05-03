import { ApiProperty } from "@nestjs/swagger";

export class FaucetResponse {
    @ApiProperty({
        type : String,
        example : "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73",
        description : "FROM Address"
    })
    from : string;
    @ApiProperty({
        type : String,
        example : "0xA09d9D7e52C14DA831D1E0a559520B9D69407627",
        description : "To Address"
    })
    to : string;
    @ApiProperty({
        type : String,
        example : "5",
        description : "전송금액"
    })
    value : string;
    @ApiProperty({
        type : String,
        example : "0x5284f03fca0769234cda0a66f736264c6cf6bc36050fa8fd11361664f5cc68c7",
        description : "Transaction Hash"
    })
    txHash : string;
}