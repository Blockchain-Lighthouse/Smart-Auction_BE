import { CACHE_MANAGER, HttpException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Cache } from "cache-manager";


@Injectable()
export class RedisRepository {
    constructor(
        @Inject(CACHE_MANAGER) private redis : Cache
    ) {
    }

    async getRedis(key : string) : Promise<any> {
        try {
            return await this.redis.get(key);
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

    async setRedis(key : string, value : any, time : number) {
  
        try {
            await this.redis.set(key, value, { ttl : time });
        } catch(e) {
            throw new HttpException(e, 400);  
        }
    }

    async delRedis(key : string) {
        try {
            await this.redis.del(key);
        } catch(e) {
            throw new HttpException(e, 400); 
        }
    }
}