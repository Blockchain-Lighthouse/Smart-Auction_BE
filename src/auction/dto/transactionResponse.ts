import { ApiProperty } from "@nestjs/swagger";

export class TransactionResponse {
    @ApiProperty({
        example : "0x1c6e454211bfdb9e6a1f7bd3907a6a5f76557e4a",
        description : "Transaction To Address",
    })
    to : string;

    @ApiProperty({
        example : "0xb0524dc8b8d97abe59fa48470828210f9fe2f412",
        description : "Transaction From Address",
    })
    from : string;

    @ApiProperty({
        example : "21000",
        description : "Transaction Gas Used",
    })
    gasUsed : string;

    @ApiProperty({
        example : "0x3b0640849917ef3e9b3316fc6e3aa7a9257ae7203074fe7760a2d5cffba213cd",
        description : "Block Encryption HASH",
    })
    blockHash : string;

    @ApiProperty({
        example : "0x3b0640849917ef3e9b3316fc6e3aa7a9257ae7203074fe7760a2d5cffba213cd",
        description : "Transaction Hash",
    })
    transactionHash : string;

    @ApiProperty({
        example : "https://mumbai.polygonscan.com/tx/0x4a4a9d45e9f2e3f667034eee0a3c76aef1f96732f2bf355df3600a236896ae51",
        description : "Scan Site URL",
    })
    scanUrl ?: string;
}