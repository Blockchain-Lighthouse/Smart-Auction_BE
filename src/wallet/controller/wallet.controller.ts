import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Role } from 'src/auth/roles.decorator';
import { CustomApiResponse } from 'src/common/customApiResponse.decorator';
import { WalletService } from '../service/wallet.service';
import { GetMnemonicResponse } from '../dto/getMnemonicDto';
import { GenerateNewMenemonicResponse } from '../dto/generateNewMenemonicDto';
import { VerifyMnemonicDto, VerifyMnemonicResponse } from '../dto/verifyMnemonicDto';
import { DeserializeKeystoreDto, DeserializeKeystoreResponse } from '../dto/deserializeKeystoreDto';
import { SignDto, SignResponse } from '../dto/signDto';

@ApiTags('월렛 API') // Swagger Tage 설정
@Controller('wallets')
export class WalletController {
    constructor(
        private readonly walletService : WalletService
    ){}

    @ApiOperation({ 
        summary : "My Menemonic 조회 (Mnemonic 생성 후 10분간 사용가능)" ,
    })
    @Role(0)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('accesskey')
    @CustomApiResponse(GetMnemonicResponse)
    @Get("/mnemonic")
    async getMnemonic(@Request() req) {
        return await this.walletService.getMnemonic(req.user.id);
    }

    @ApiOperation({ summary : "Random Menemonic 생성 (10분)" })
    @Role(0)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('accesskey')
    @CustomApiResponse(GenerateNewMenemonicResponse)
    @Post("/mnemonic")
    async createMenemonic(@Request() req) {
        return await this.walletService.createMenemonic(req.user.id);
    }

    @ApiOperation({ summary : "Mnemonic 검증 & Keystore 생성" })
    @Role(0)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('accesskey')
    @CustomApiResponse(VerifyMnemonicResponse)
    @Post("/mnemonic/verify")
    async verifyMenemnoic(@Request() req, @Body() body : VerifyMnemonicDto) {
        return await this.walletService.verifyMnemonic(req.user.id, body.password, body.mnemonic);
    }
 
    @ApiOperation({ summary : "Keystore 복호화 (내부용)" })
    @UseGuards(JwtAuthGuard)
    @Role(2)
    @ApiBearerAuth('accesskey')
    @CustomApiResponse(DeserializeKeystoreResponse)
    @Post("/decode")
    async deserializeKeystore(@Body() body : DeserializeKeystoreDto, @Request() req) {
        return await this.walletService.deserializeKeystore(req.user.id, body.password);
    }

    @ApiOperation({ summary : "유저 서명"})
    @UseGuards(JwtAuthGuard)
    @Role(2)
    @ApiBearerAuth('accesskey')
    @CustomApiResponse(SignResponse)
    @Post("/sign")
    async sign(@Body() body : SignDto, @Request() req) {
        return this.walletService.sign(req.user.id, body.password, body.auctionId, body.signMsg);
    }

    @ApiOperation({ summary : "Faucet" })
    @UseGuards(JwtAuthGuard)
    @Role(2)
    @ApiBearerAuth('accesskey')
    @Post("/faucet")
    async faucet(@Request() req) {
        return this.walletService.faucet(req.user.id, "5");
    }
}
