import { PickType } from "@nestjs/swagger";
import { User } from "src/entities/user.entity";

export class SetProfileImageDto extends PickType(User, [
    "profile",
]){}