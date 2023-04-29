import { BadRequestException, HttpException, Inject, Injectable } from '@nestjs/common';
import { Wallet, utils, ethers } from "ethers";
import { UserRepository } from 'src/user/repository/user.repository';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { AuctionRepository } from 'src/auction/repository/auction.repository';
import { GenerateNewMenemonicResponse } from '../dto/generateNewMenemonicDto';
import { VerifyMnemonicResponse } from '../dto/verifyMnemonicDto';
import { GetMnemonicResponse} from '../dto/getMnemonicDto';
import { DeserializeKeystoreResponse } from '../dto/deserializeKeystoreDto';
import { SignResponse } from '../dto/signDto';
import { RedisRepository } from 'src/redis/redis.repository';

@Injectable()
export class WalletService {
    private provider;

    constructor(
        private readonly userRepo : UserRepository,
        private readonly auctionRepo : AuctionRepository,
        private readonly redisRepo : RedisRepository,
    ){
        this.provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_PROVIDER)
    }

     // # Create Random 12 words Menemonic
    async createMenemonic(userId : number) : Promise<GenerateNewMenemonicResponse> {
        // Find User
        const user = await this.userRepo.getUserById(userId);
        const mnemonic = await utils.entropyToMnemonic(utils.randomBytes(16));
        const toAryMnemonic = mnemonic.split(" ");

        // And Save Redis USer : Menemonic;
        await this.redisRepo.setRedis(`verify_${user.email}`, toAryMnemonic, 600);

        return {
            mnemonic
        };
    }

    // # Mnemonic Verification & Create Keystore
    async verifyMnemonic(userId : number, password : string, mnemonic : string) : Promise<VerifyMnemonicResponse> {
        // 유저 비밀번호 확인
        const user = await this.userRepo.getUserById(userId);
        let result = await bcrypt.compare(password, user.password);
        if(!result) {
            throw new BadRequestException("PASSWORD NOT MATCH");
        }
        
        // Mnemonic 비교
        const userRedisKey = `verify_${user.email}`;
        const mnemonicRedis = await this.redisRepo.getRedis(userRedisKey);
        const mnemonicRedisTostring = mnemonicRedis.join(" ");
        if (mnemonicRedisTostring != mnemonic) {
            throw new BadRequestException("MNEMONIC NOT MATCH");
        }

        // 키스토어 생성 & 저장
        const keystore : string = (await this.generateKeystore(password, mnemonic)).keystore;
        const publicKey : string = (await this.generateKeystore(password, mnemonic)).publicKey;
        const updatedUser : User = await this.userRepo.updateUserKeystore(userId, keystore, publicKey);

        return {
            id : updatedUser.id,
        };
    }

    // # Create Random 12 words Menemonic
    async getMnemonic(userId : number) : Promise<GetMnemonicResponse> {
        // Find User
        const user = await this.userRepo.getUserById(userId);
        // And Get Redis User : Menemonic;
        const mnemonic = await this.redisRepo.getRedis(`verify_${user.email}`);

        return {
            mnemonic : mnemonic
        };
    }

    // # Generate Keystore
    async generateKeystore(password : string, mnemonic : string) : Promise<{
        publicKey : string;
        keystore : string;
    }>{
        // Default PATH = (0인덱스 월렛) "m/44'/60'/0'/0/0"
        const wallet = await Wallet.fromMnemonic(
            mnemonic
        )

        const keystoreJSON = await wallet.encrypt(password);
        
        return {
            publicKey : wallet.address,
            keystore : keystoreJSON
        }
    }

    // # Deserialize Keystore
    async deserializaKeystore(ks : string, password: string) : Promise<{
        publicKey : string;
        privateKey : string;
    }>{
        try {
            const wallet = await ethers.Wallet.fromEncryptedJson(ks, password);
            console.log(`pBUC : `, wallet.address);
    
            return {
                publicKey : wallet.address,
                privateKey : wallet.privateKey,
            }
            
        } catch(e) {
            throw new BadRequestException("PASSWORD NOT MATCH");
        }
    }

    // # Sign Message
    async signMessage(ks : string, password : string, msg: string) : Promise<{
        msgHash : string;
        v : number;
        r : string;
        s : string;
    }> {
        try {
            // 메시지 서명
            const address = ethers.utils.getAddress(msg);
            const wallet = await ethers.Wallet.fromEncryptedJson(ks, password);
            const eoaHash = await ethers.utils.keccak256(address)
            const signature = await wallet.signMessage(ethers.utils.arrayify(eoaHash));
            const { v, r, s } = await ethers.utils.splitSignature(signature);

            return {
                msgHash : eoaHash,
                v : v,
                r : r,
                s : s
            };
        } catch(e) {
            throw new HttpException(e, 400);
        }

    }
    
    // # Change Keystore Password
    async ChangeKeystorePassword(keystore : string, oldPassword : string, newPassword : string) : Promise<{
        publicKey : string;
        keystore : string;
    }>{
        try {
            const decryptedKeystore = await ethers.Wallet.fromEncryptedJson(keystore, oldPassword);
            const privateKey = decryptedKeystore.privateKey;
            const wallet = new ethers.Wallet(privateKey);
            const reGeneratedkeystore = await wallet.encrypt(newPassword);
            return {
                publicKey : wallet.address,
                keystore : reGeneratedkeystore,
            }
        } catch(e) {
            throw new HttpException(e, 400);
        }

    };

    // # Get Balance Format Ether
    async getBalance(address : string) : Promise<{
        address : string,
        balance : string,
    }>{
        try {
            const balance = await this.provider.getBalance(address);
            const formatEther = await ethers.utils.formatEther(balance);
      
            return {
                address : address,
                balance : formatEther,
            }
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

     // # Deserliaize KeyStore Using KeyStore File & User Password
     async deserializeKeystore(userId : number, password : string) : Promise<DeserializeKeystoreResponse> {
        // Find User By ID & Get Keystore
        const user : User = await this.userRepo.getUserById(userId);
        const ks = user.keystore;
        // Keystore To Deserialize Public Key & Private Key
        return await this.deserializaKeystore(ks, password);
    }

    // # user sign with wallet
    async sign(userId : number, password : string, auctionId : number, msg ?: string) : Promise<SignResponse> {
        try {
            // Find User By ID & Get Keystore
            const user : User = await this.userRepo.getUserById(userId);
            const ks = user.keystore;
            let signMsg = msg ? msg : "0xA09d9D7e52C14DA831D1E0a559520B9D69407627";
            
            // Address Check;
            if (msg.length < 40) {
                throw new BadRequestException("BAD EOA");
            }
         
            let parsingMsg = msg[0]+msg[1];
      
            if (parsingMsg != "0x"){
                signMsg = "0x"+msg;
            }

            // sing with ks && password && message
            const signedResult = await this.signMessage(ks, password, signMsg);

            // Redis Save (EOA_AUCTIONID)
            const redisKey = `${user.publicKey}_${auctionId}`;
            await this.redisRepo.setRedis(redisKey, signedResult, 604800); // 7 Days; 

            // Auction 상태 변환
            await this.auctionRepo.updateAuctionStatus(auctionId, 4);

            return {
                signedBy :user.publicKey,
            }
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

}

