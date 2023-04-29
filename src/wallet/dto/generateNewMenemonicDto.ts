import { ApiProperty } from "@nestjs/swagger";

export class GenerateNewMenemonicResponse {
    @ApiProperty({
        type : String,
        example : "useless begin spirit assist witness man cool tape good scare raw lava",
        description : "Mnemonic Phrase"
    })
    mnemonic : string;
}