import { ApiProperty } from "@nestjs/swagger";

export class GetMnemonicResponse {
    @ApiProperty({
        example : [
            "person",
            "trim",
            "nuclear",
            "fold",
            "language",
            "post",
            "nuclear",
            "essence",
            "behind",
            "silver",
            "labor",
            "avocado"
          ],
        description : "Mnemonic"
    })
    mnemonic : object;
}