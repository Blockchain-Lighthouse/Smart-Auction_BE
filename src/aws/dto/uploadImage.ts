import { ApiProperty } from "@nestjs/swagger";

export class UploadImageResponse {
    @ApiProperty({
        example : "https://blockchain-lighthouse.s3.ap-northeast-2.amazonaws.com/auction/users/1681205836745KakaoTalk_Photo_2022-02-14-00-39-03 001.png",
        description : "Upload된 이미지 URL"
    })
    path : string;
}
