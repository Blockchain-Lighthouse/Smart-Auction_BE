import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { ResendEmailResponse, SignUpUserDto, SignUpUserResponse } from '../dto/signupUserDto';
import { LoginResponse, LoginUserDto } from '../dto/loginUserDto';
import { UserRepository } from '../repository/user.repository';
import * as bcrypt from 'bcrypt';
import { WalletService } from 'src/wallet/service/wallet.service';
import { AuthService } from 'src/auth/auth.service';
import { VerifySignUpResponse } from '../dto/verifySignUpDto';
import { AuthResponse } from '../dto/authDto';
import { DuplicateCheckResponse } from '../dto/duplicateCheckDto';
import { RefreshAccessTokenResponse } from '../dto/refreshTokenResponse';
import { SendResetPasswordEmailDto, SendResetPasswordEmailResponse, VerifyResetPasswordEmail, VerifyResetPasswordResponse } from '../dto/resetPasswordDto';
import { UpdateNicknameResponse } from '../dto/updateNicknameDto';
import { MailerService } from '@nestjs-modules/mailer';
import { ContactEmailDto, ContactEmailResponse } from '../dto/contactEmailDto';
import { AwsService } from 'src/aws/service/aws.service';
import { RedisRepository } from 'src/redis/redis.repository';

@Injectable()
export class UserService {
    constructor(
        private userRepo : UserRepository,
        private wallet : WalletService,
        private authService : AuthService,
        private readonly mailerService : MailerService,
        private readonly awsService : AwsService,
        private readonly redisRepo : RedisRepository
    ){}
    
    // # Signup User
    async signUp(body : SignUpUserDto) : Promise<SignUpUserResponse> {
        // Hash Password
        body.password = await bcrypt.hash(
            body.password, 10
        )
        // Save User Into DB;
        const registerResult = await this.userRepo.signUpUser(body);

        // Create 6 Numbers;
        const randomNumber = String(Math.floor(Math.random()*1000000)).padStart(6, "0");

        // Save Into Redis;
        const redisKey = `signup_${body.email}`;
        await this.redisRepo.setRedis(redisKey, randomNumber, 300);

        // Send Verification Email;
        const title = `BlockchainLightHouse Verification Code : ${randomNumber}`;
        const content = `안녕하세요. Blockchain LightHouse입니다. \r\n 인증코드 : ${randomNumber} \r\n 인증코드 유효기간은 5분동안 유효합니다.`;

        await this.awsService.sendSesEmail(
            body.email,
            title,
            content
        )
        
        return {
            id: registerResult.id,
            email: registerResult.email
        };
    }

    // # 인증코드 확인
    async verifySignUp(userId : number, verificationCode : string) : Promise<VerifySignUpResponse> {
        console.log("Verify SignUp");
        const user = await this.userRepo.getUserById(userId);
        const redisKey = `signup_${user.email}`;
        const verificationCodeRedis = await this.redisRepo.getRedis(redisKey);
        // Code 일치확인
        console.log("SEE CODE==");
        console.log(verificationCode, verificationCodeRedis);
        if (verificationCodeRedis != verificationCode) {
            throw new BadRequestException("NOT MATCH");
        }
        // Update User Role
        const updatedUser = await this.userRepo.updateUser(user.id, 1);

        return {
            id : updatedUser.id,
            role : updatedUser.role
        };
    }

    // # email resend
    async ResendEmail(userId : number): Promise<ResendEmailResponse> {
        let user = await this.userRepo.getUserById(userId)
        if(user.role > 0) {
            throw new BadRequestException("ALREADY VERIFIED");
        }

        // Create 6 Numbers;
        const randNum = String(Math.floor(Math.random()*1000000)).padStart(6, "0");

        // Save Into Redis; (5분)
        const redisKey = `signup_${user.email}`;
        await this.redisRepo.setRedis(redisKey, randNum, 300);

        // Send Verification Email;
        const title = `BlockchainLightHouse Verification Code : ${randNum}`;
        const content = `안녕하세요. Blockchain LightHouse입니다. \r\n 인증코드 : ${randNum} \r\n 인증코드 유효기간은 5분동안 유효합니다.`;
        
        // 이메일 전송
        await this.awsService.sendSesEmail(
            user.email,
            title,
            content
        )
          
        return {
            email: user.email,
            code : randNum
        };
    }

    // # Login User
    async signInUser(body : LoginUserDto) : Promise<LoginResponse> {
        // 유저 Email 확인
        let user = await this.userRepo.getUserByEmail(body.email);
        if (!user) {
            throw new BadRequestException("USER NOT EXIST");
        }

        // 비밀번호 확인
        let result = await bcrypt.compare(body.password, user.password);
        if(!result) {
            throw new BadRequestException("PASSWORD NOT MATCH");
        }

        // @로그인 완료
        // Generate Access Token
        let acTokenResult = await this.authService.createToken(user.id, user.role, "1800s");

        // Generate Refresh Token
        let rfTokenResult = await this.authService.createToken(user.id, user.role, "86400s");

        // 레디스에 refresh token 저장
        const redisKey = `login_rf_${user.email}`;
        this.redisRepo.setRedis(redisKey, rfTokenResult.token, 86400);

        return {
            acToken : acTokenResult.token,
            acTokenExpiresAt: acTokenResult.expiredAt,
            rfToken : rfTokenResult.token,
            rfTokenExpiresAt: rfTokenResult.expiredAt
        }
    }

    // # 유저정보조회
    async getUser(userId : number) : Promise<AuthResponse> {
        let user = await this.userRepo.getUserById(userId);
        let userEoa = "0x";
        let userBalance = "0";

        if(user.publicKey && user.publicKey) {
            userEoa = user.publicKey;
            let getBalance = await this.wallet.getBalance(user.publicKey);
            userBalance = getBalance.balance;
        }


        return { 
            id : user.id , 
            email : user.email, 
            nickname : user.nickname, 
            role : user.role, 
            registeredAt : user.registeredAt, 
            updatedAt : user.updatedAt,
            publicKey : userEoa,
            balance : userBalance,
        }
    }

    // # AccessToken Refresh
    async refreshAccessToken(userId :number , token :string) : Promise<RefreshAccessTokenResponse>{
        // User 찾고
        const user = await this.userRepo.getUserById(userId);

        // Redis에 등록된 RF Token 탐색 (유효기간 1일)
        const redisKey = `login_rf_${user.email}`;

        //들어온 토큰과 레디스에 저장된 토큰값 비교
        const rfToken = await this.redisRepo.getRedis(redisKey);
        if (rfToken !== token) {
            throw new BadRequestException("RefreshToken Not Vaild") 
        }

        // ACCESS TOKEN 재발급
        let newAcToken = await this.authService.createToken(user.id, user.role, "900s");

        return {
            acToken : newAcToken.token, 
            acTokenExpiresAt : newAcToken.expiredAt
        };
    }

    //이메일 중복체크
    async emailDuplicateCheck(email : string) : Promise<DuplicateCheckResponse>{
        let result = false;
        const findedUser = await this.userRepo.getUserByEmail(email);

        if (findedUser) {
            result = true;
        }

        return {
            is_dup : result // True = 중복됨 || False = 안중복
        }
    }

    //닉네임 중복체크
    async nicknameDuplicateCheck(nickname : string) : Promise<DuplicateCheckResponse>{
        let result = false;
        
        const findedUser = await this.userRepo.getUserByNickname(nickname);

        if (findedUser) {
            result = true;
        }

        return {
            is_dup : result // True = 중복됨 || False = 안중복
        }
    }

    //비밀번호 변경 - 이메일전송 (1)
    async sendResetPasswordEmail(body : SendResetPasswordEmailDto) : Promise<SendResetPasswordEmailResponse>{
        // User 탐색
        const user = await this.userRepo.getUserByEmail(body.email);
        if (!user) {
            throw new BadRequestException(`USER NOT EXIST`);
        }
        // Token 생성
        const resetToken = await this.authService.createToken(user.id, user.role, "300s");
        
        // Send 이메일 설정 이메일
        const url = `https://smart-auction.vercel.app/reset/${resetToken.token}`;
        const title = `Smart Auction Reset Password`;
        const content = `안녕하세요. Smart Auction입니다. \r\n URL : ${url} \r\n URL로 접속해서 비밀번호 초기화를 진행해주세요. \r\n 유효시간은 5분입니다.`;
        
   
        await this.awsService.sendSesEmail(user.email, title, content);
      
        return {
            resetToken : resetToken.token,
            expiredAt : resetToken.expiredAt
        }
    }
    
    //비밀번호 변경 - 비밀번호 변경 (2)
    async verifyResetPasswordEmail(body : VerifyResetPasswordEmail, userId : number) : Promise<VerifyResetPasswordResponse>{
        // 키스토어 생성 & 저장
        const keystore = await this.wallet.generateKeystore(body.password, body.mnemonic);

        // New Password Bcrypt 암호화
        body.password = await bcrypt.hash(
            body.password, 10
        )

        // User 업데이트
        const updatedUser : User = await this.userRepo.updateUserKeystore(
            userId, 
            keystore.keystore, 
            keystore.publicKey, 
            body.password
        );

        return {
            userId : updatedUser.id
        }
    }

    // Send Contact Email
    async sendContactEmail(body : ContactEmailDto, userId :number) :Promise<ContactEmailResponse> {
        try { 
            //유저 찾기
            const user = await this.userRepo.getUserById(userId);
            if (!user){
                throw new BadRequestException("USER NOT EXIST");
            }

            //메일 보내기
            const mail = await this.mailerService.sendMail({
                to: "blockmonkey1992@gmail.com",
                from : user.email,
                subject : body.title,
                text : body.description
            })
            
            return {
                from : mail.envelope.from
            }

        } catch (e) {
            throw new InternalServerErrorException("SMTP_ERR")
        }
    }

    //닉네임 업데이트
    async updateNickname(nickname : string, userId : number) : Promise<UpdateNicknameResponse>{
        //중복체크
        const user = await this.userRepo.getUserByNickname(nickname);
        if (user) {
            throw new BadRequestException("Already Exist Nickname")
        }

        //업데이트
        const updatedUser = await this.userRepo.updateUser(userId, null, nickname);

        return {
            userId : updatedUser.id
        }
    }

    async updateUserProfile(userId : number, profileSrc : string) : Promise<User> {
        return await this.userRepo.updateUserProfile(userId, profileSrc);
    }
}
