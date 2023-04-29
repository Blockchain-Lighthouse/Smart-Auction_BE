import { Body, Controller, Get, Post, UseGuards, Request, HttpCode, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Role } from 'src/auth/roles.decorator';
import { CustomApiResponse } from 'src/common/customApiResponse.decorator';
import { AuthResponse } from '../dto/authDto';
import { LoginResponse, LoginUserDto } from '../dto/loginUserDto';
import { ResendEmailResponse, SignUpUserDto, SignUpUserResponse } from '../dto/signupUserDto';
import { VerifySignUpDto, VerifySignUpResponse } from '../dto/verifySignUpDto';
import { UserService } from '../service/user.service';
import { EmailDuplicateCheckDto, DuplicateCheckResponse, NicknameDuplicateCheckDto } from '../dto/duplicateCheckDto';
import { RefreshAccessTokenResponse } from '../dto/refreshTokenResponse';
import { SendResetPasswordEmailDto, SendResetPasswordEmailResponse, VerifyResetPasswordEmail, VerifyResetPasswordResponse } from '../dto/resetPasswordDto';
import { UpdateNicknameDto, UpdateNicknameResponse } from '../dto/updateNicknameDto';
import { ContactEmailDto, ContactEmailResponse } from '../dto/contactEmailDto';

@Controller('users')
@ApiTags('유저 API') // Swagger Tage 설정
@ApiResponse({ status: 400, description : "REQUST PAYLOAD NOT PROPER" })
@ApiResponse({ status: 401, description : "AUTHORIAZATION FORBIDDEN" })
@ApiResponse({ status: 500, description : "INTERNAL SERVER ERR" })
@ApiResponse({ status: 409, description : "USER EMAIL DUPLICATE" })
export class UserController {
    constructor(
        private userService : UserService
    ){}

    @ApiOperation({ summary : "Health check"})
    @Post("/health")
    async getServerTime() {
        let serverTime = new Date();
        return serverTime;
    }

    @ApiOperation({ summary : "회원가입" })
    @Post("/sign-up")
    @CustomApiResponse(SignUpUserResponse)
    async signUp(@Body() body : SignUpUserDto) {
        return await this.userService.signUp(body);
    }

    @ApiOperation({ summary : "회원가입 - 이메일 인증" })
    @Role(0)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('accesskey')
    @CustomApiResponse(VerifySignUpResponse)
    @Post("/sign-up/verify")
    async verifySignUp(@Request() req, @Body() body : VerifySignUpDto) {
        return await this.userService.verifySignUp(req.user.id, body.verificationCode);
    }

    @ApiOperation({ summary : "로그인" })
    @Post("/sign-in")
    @CustomApiResponse(LoginResponse)
    async signInUser(@Body() body: LoginUserDto) {
        return this.userService.signInUser(body);
    }

    @ApiOperation({ summary : "회원정보조회" })
    @UseGuards(JwtAuthGuard)
    @Role(0)
    @CustomApiResponse(AuthResponse)
    @ApiBearerAuth('accesskey')
    @Get("/")
    async getUser(@Request() req){
        return this.userService.getUser(req.user.id);
    }

    @ApiOperation({ summary : "회원가입 인증코드 재전송" })
    @UseGuards(JwtAuthGuard)
    @Role(0)
    @ApiBearerAuth('accesskey')
    @CustomApiResponse(ResendEmailResponse)
    @Post("/sign-up/resend")
    async ResendEmail(@Request() req) {
        return this.userService.ResendEmail(req.user.id)
    }

    // ㅇㅕ기서부터 옮옮겨겨주주면면될될듯듯.
    @ApiOperation({ summary : "이메일 중복체크", description: "중복(is_dup) = true, 중복되지 않음(is_dup) = false" })
    @CustomApiResponse(DuplicateCheckResponse)
    @Post("/email/duplicate")
    @HttpCode(200)
    async EmailDuplicateCheck(@Body() body : EmailDuplicateCheckDto) {
        return this.userService.emailDuplicateCheck(body.email);
    }

    @ApiOperation({ summary : "닉네임 중복체크", description: "중복(is_dup) = true, 중복되지 않음(is_dup) = false" })
    @CustomApiResponse(DuplicateCheckResponse)
    @Post("/nickname/duplicate")
    @HttpCode(200)
    async NickNameDuplicateCheck(@Body() body : NicknameDuplicateCheckDto) {
        return this.userService.nicknameDuplicateCheck(body.nickname);
    }

    @ApiOperation({ summary : "닉네임 설정", description: "닉네임 설정" })
    @UseGuards(JwtAuthGuard)
    @Role(1)
    @ApiBearerAuth('accesskey')
    @CustomApiResponse(UpdateNicknameResponse)
    @Patch("/nickname")
    async updateNickname(@Body() body : UpdateNicknameDto, @Request() req) {
        return this.userService.updateNickname(body.nickname, req.user.id);
    }

    @ApiOperation({ summary : "비밀번호 재설정 - 이메일 전송 (1)"})
    @CustomApiResponse(SendResetPasswordEmailResponse)
    @Post("/resetpw/send-email")
    async sendResetPasswordEmail(@Body() body : SendResetPasswordEmailDto) {
        return this.userService.sendResetPasswordEmail(body);
    }

    @ApiOperation({ summary : "비밀번호 재설정 - 유저 정보 업데이트 (2)"})
    @CustomApiResponse(VerifyResetPasswordResponse)
    @UseGuards(JwtAuthGuard)
    @Role(2)
    @ApiBearerAuth('resetkey')
    @Patch("/resetpw")
    async verifyResetPasswordEmail(@Body() body : VerifyResetPasswordEmail, @Request() req) {
        const user = req.user;
        return this.userService.verifyResetPasswordEmail(body, user.id);
    }

    @ApiOperation({ summary : "AccessToken 재발급" ,description : "RefreshToken을 넣어 AccessToken을 재생성한다."})
    @UseGuards(JwtAuthGuard)
    @Role(0)
    @CustomApiResponse(RefreshAccessTokenResponse)
    @ApiBearerAuth('refreshkey')
    @Post("/refresh")
    async refreshAccessToken(@Request() req){
        // Token Extraction
        const token = req.headers.authorization.split("Bearer ")[1];
        return this.userService.refreshAccessToken(req.user.id, token);
    }

    @ApiOperation({ summary : "Contact Email 전송" })
    @UseGuards(JwtAuthGuard)
    @Role(0)
    @ApiBearerAuth('accesskey')
    @CustomApiResponse(ContactEmailResponse)
    @Post("/contact")
    async sendContactEmail(@Body() body : ContactEmailDto, @Request() req) {
        let userId = req.user.id;
        return this.userService.sendContactEmail(body, userId);
    }
}
