import { ApiProperty } from "@nestjs/swagger";

export class ContactEmailDto {
    @ApiProperty({
        example : "안녕하세요 제목입니다.",
        description : "title",
        required: true
    })
    title : string;

    @ApiProperty({
        example : "본문입니다.",
        description : "description",
        required : true
    })
    description : string;
}

export class ContactEmailResponse {
    @ApiProperty({
        example : "zzoo852@naver.com",
        description : "From",
        required: true
    })
    from : string;
}