import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class DeserializeKeystoreDto {
    @ApiProperty({
        example : "aSecret!3",
        description : "password - Min=6 Max=20",
        required: true
    })
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    password : string;
}

export class DeserializeKeystoreResponse {
    @ApiProperty({
        example : "0x479263333D4A391A4F7f2D26dE55E9B38c87bA97",
        description : "Public Key",
        required: true
    })
    publicKey : string;
    @ApiProperty({
        example : "99a4a4790b942578be940a7be27cae25880c24a49f11f1b5c1598d0645783c25",
        description : "Private Key",
        required: true
    })
    privateKey : string;
}

