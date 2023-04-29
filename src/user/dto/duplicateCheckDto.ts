import { ApiProperty, PickType } from "@nestjs/swagger";
import { User } from "src/entities/user.entity";

export class EmailDuplicateCheckDto extends PickType(User, [
        'email'
    ],  
){}

export class NicknameDuplicateCheckDto extends PickType(User, [
    'nickname'
],  
){}

//Duplicate Response
export class DuplicateCheckResponse {
    @ApiProperty({
        example : true,
    })
    is_dup : boolean;
}