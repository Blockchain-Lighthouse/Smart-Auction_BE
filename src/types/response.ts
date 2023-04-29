import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { Exclude, Type } from "class-transformer";

export class CustomResponseType <T> {
    @ApiProperty({
        example : 201,
        description : "Status Code",
    })
    statusCode : number;

    payload : T
}