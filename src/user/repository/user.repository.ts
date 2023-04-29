import { BadRequestException, CACHE_MANAGER, ConflictException, HttpException, Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { User } from "src/entities/user.entity";
import { DataSource, Repository } from "typeorm";
import { SignUpUserDto } from "../dto/signupUserDto";
import { Favorite } from "src/entities/favorite.entity";


@Injectable()
export class UserRepository extends Repository<User> {
    constructor(
        private data : DataSource,
    ) {
        // 상위클래스 Repository 초기화; (targetEntity, manager: EntityManager, queryRunner?: QueryRunner)
        super(User, data.createEntityManager());
    }

    async signUpUser(body : SignUpUserDto) : Promise<User> {
        // 유저 중복체크 By Email
        const cUser = await this.getUserByEmail(body.email);
        if (cUser) {
            throw new ConflictException("USER EXIST");
        }
        
        // 유저 저장 Into DB
        try {
            const tx = await this.create({
                email : body.email,
                password : body.password,
                nickname : body.nickname,
            })

            await this.save(tx);
            return tx;
        } catch (e) {
            console.log(e);
            if (e.code === "ER_DUP_ENTRY") {
                throw new BadRequestException("DUPLICATE NICKNAME");
            } else {
                throw new HttpException(e, 400);
            }
        }
    }

    async updateUser(userId : number, role ?: number, nickname ?: string) : Promise<User> {
        try {
            const userToUpdate = await this.findOneBy({
                id : userId,
            })

            // 유저 확인
            if (!userToUpdate) {
                throw new BadRequestException("USER NOT EXIST");
            }

            userToUpdate.role = role ? role : userToUpdate.role;
            userToUpdate.nickname = nickname ? nickname : userToUpdate.nickname;

            await this.save(userToUpdate);

            return userToUpdate;

        } catch (e) {
            throw new HttpException(e, 400);
        }
    }
    
    async addUserFavorite(favorite : Favorite, userId : number) : Promise<User> {
        try {
            let user = await this.findOne({
                where: { id : userId },
                relations: ["favorites"]
            })

            // User에 Favorite 객체가 있는지 확인한다. 있다면, Do nothing
            const isExist = user.favorites.filter(item => item.auctuinId === favorite.auctuinId);
            // 없다면 Favorite에 추가.
            if (!isExist) {
                user.favorites.push(favorite);
            }

            this.save(user);
            return user;

        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

    async removeUserFavorite(favorite : Favorite, userId : number) : Promise<User>{
        try {
            let user = await this.findOne({
                where: { id : userId },
                relations: ["favorites"]
            })
    
            // Favorite이 이미 있다면 삭제;
            user.favorites.map((item, idx)=> {
                if(item.auctuinId == favorite.auctuinId) {
                    user.favorites.splice(idx, 1);
                }
                // 없다면 Do nothing;
            })
    
            this.save(user);
            return user;
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

    async updateUserKeystore(userId : number, keystore : string, publicKey : string, password ?: string)  : Promise<User> {
        try {
            const userToUpdate = await this.findOneBy({
                id : userId,
            })
            // 유저 확인
            if (!userToUpdate) {
                throw new BadRequestException("USER NOT EXIST");
            }

            userToUpdate.keystore = keystore;
            userToUpdate.publicKey = publicKey;

            if (password) {
                userToUpdate.password = password;
            }
            
            userToUpdate.role = 2;

            await this.save(userToUpdate);
            return userToUpdate;
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

    async updateUserProfile(userId : number, profileSrc : string) : Promise<User>{
        try {
            const userToUpdate = await this.findOneBy({
                id : userId,
            })
            if (!userToUpdate) {
                throw new BadRequestException("USER NOT EXIST");
            }

            userToUpdate.profile = profileSrc;

            await this.save(userToUpdate);
            return userToUpdate;
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

    async getUserById(id : number) : Promise<User> {
        try {
            let user = await this.findOne({
                where: { id : id },
                relations: ["favorites"]
            })
            return user;
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

    async getUserByEmail(email : string) : Promise<User> {
        try {
            let user = await this.findOneBy({ 
                email 
            });
            return user;
        } catch (e) {
            throw new HttpException(e, 400);
        }
    }

    async getUserByNickname(nickname : string) : Promise<User> {
        try {
            let user = await this.findOneBy({ 
                nickname 
            });
            return user;
        } catch (e) {
            throw new HttpException(e, 400);
        }
    }

    async getUserByEoa(eoa : string) : Promise<User> {
        try {
            let user = await this.findOneBy({ 
                publicKey : eoa,
             });
            return user;
            
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

  
}