import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest : ExtractJwt.fromAuthHeaderWithScheme("Bearer"),
            secretOrKey : process.env.JWT_SECRET, // Secret Key
            ignoreExpiration : false, //true로 설정하면 Passport에 토큰 검증을 위임하지 않고 직접 검증, false는 Passport에 검증 위임
        });
    }

    async validate(payload) {
        return payload
    }
}

