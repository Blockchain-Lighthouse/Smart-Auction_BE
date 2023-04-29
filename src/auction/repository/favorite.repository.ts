import { HttpException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Favorite } from "src/entities/favorite.entity";
import { User } from "src/entities/user.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class FavoriteRepository extends Repository<Favorite> {
    constructor(
        private readonly data : DataSource,
    ){
        super(Favorite, data.createEntityManager());
    }

    async addFavorite(user : User, auctionId : number) : Promise<Favorite> {
        try {
            const favorite = await this.create({
                user : user,
                auctuinId : auctionId
            })

            const result = await this.save(favorite);
            return result;
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

    async removeFavorite(favorite : Favorite) {
        try {
            await this.remove(favorite);
        } catch(e) {
            throw new HttpException(e, 400);
        }
    }
}