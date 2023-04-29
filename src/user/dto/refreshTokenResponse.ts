import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class RefreshAccessTokenResponse {
    @ApiProperty({
        description : "Access Token", 
        example : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6MCwiaWF0IjoxNjc5NzI4OTEwLCJleHAiOjE2Nzk3MjkyMTB9.Lh7uH0PfmTCqwfyO3Q_1cdozpjL3HOcn0sO9LokSbbc"
    })
    acToken : string 
    @ApiProperty({
        description : "Access Token Expires At", 
        example : 1679734047 
    })
    acTokenExpiresAt : number
}
