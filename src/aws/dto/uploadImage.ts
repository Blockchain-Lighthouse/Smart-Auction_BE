import { ApiProperty } from "@nestjs/swagger";

export class UploadImageResponse {
    @ApiProperty({
        example : "https://ipfs.io/ipfs/bafyreicdrpeudimbn2gnoeccgrpqam5fzfsfyyv7yc5hjqvh7liel5bv6q/metadata.json",
        description : "Upload된 IPFS 이미지"
    })
    path : string;
}
