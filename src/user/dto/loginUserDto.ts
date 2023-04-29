import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty,MaxLength, MinLength } from "class-validator";
import { User } from "src/entities/user.entity";

export class LoginUserDto extends PickType(
    User, ["email", "password"]
){}

export class LoginResponse {
    @ApiProperty({
        description : "Access Token", 
        example : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6MCwiaWF0IjoxNjc5NzI4OTEwLCJleHAiOjE2Nzk3MjkyMTB9.Lh7uH0PfmTCqwfyO3Q_1cdozpjL3HOcn0sO9LokSbbc"
    })
    acToken : string;

    @ApiProperty({
        description : "Access Token ExpiresAt", 
        example : 1679734047 
    })
    acTokenExpiresAt : number;

    @ApiProperty({
        description : "Refresh Token", 
        example : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6MCwiaWF0IjoxNjc5NzMzNzQ3LCJleHAiOjE2Nzk4MjAxNDd9.YAO1OvGCYHr6b8H7y8WF-Uvn9McQBzfuxjgRyVJ7Dxk"
    })
    rfToken : string;

    @ApiProperty({
        description : "Refresh Token ExpiresAt", 
        example : 1679820147 
    })
    rfTokenExpiresAt : number;
}