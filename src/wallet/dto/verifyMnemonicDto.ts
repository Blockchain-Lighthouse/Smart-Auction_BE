import { ApiProperty } from "@nestjs/swagger";

export class VerifyMnemonicDto {
    @ApiProperty({
        example : "budget unhappy snap elephant include game undo blue circle bar cushion random",
        description : "Mnemonic Pharse",
        required: true
    })
    mnemonic : string;

    @ApiProperty({
        example : "aSecret!3",
        description : "Password",
        required: true
    })
    password : string;
}

export class VerifyMnemonicResponse {
    @ApiProperty({
        example : 1,
        description : "Updated User ID",
        required: true
    })
    id : number;
}