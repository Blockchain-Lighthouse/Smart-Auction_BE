import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService : JwtService
    ){}
    
    //@Token 재발급
    async createToken(id : number, role : number, expiresIn : string) : Promise<{
        token : string;
        expiredAt : number;
    }>{
        const jwtTokenPayload = {
            id,
            role,
        }
        const currentTime = new Date();
        const utcTime = new Date(currentTime.getTime() + Number.parseInt(expiresIn, 10) * 1000).toUTCString();
        const utcDate = new Date(utcTime);  // UTC 시간 문자열을 Date 객체로 변환
        const expiredAt = utcDate.getTime() / 1000;  // 밀리초 단위로 된 Unix 시간으로 변환
        const token = this.jwtService.sign(jwtTokenPayload, { 
            expiresIn,
        })

        return {
            token,
            expiredAt
        };
    }
}
