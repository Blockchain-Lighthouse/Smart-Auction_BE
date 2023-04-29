import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from './jwt/jwt.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports : [
    ConfigModule.forRoot(),
    PassportModule,
    // JWT 만들어줄 때 사용
    JwtModule.register({
      secret : process.env.JWT_SECRET,
      signOptions : {expiresIn : "300s"},
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports :[AuthService]
})

export class AuthModule {}
