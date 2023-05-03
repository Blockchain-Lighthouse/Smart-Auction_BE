import { BadRequestException, Body, Controller, Get, Param, Post, Req, Request, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Role } from 'src/auth/roles.decorator';
import { CustomApiResponse } from 'src/common/customApiResponse.decorator';
import { AuctionService } from '../service/auction.service';
import { BidDto } from '../dto/bidDto';
import { CreateAuctionDto, CreateAuctionResponse } from '../dto/createAuctionDto';
import { AuctionDetailResponse, GetAuctionResponse } from '../dto/getAuctionDto';
import { BidderDto, GetBiddersResponse } from '../dto/bidHistroyDto';
import { WithdarwDto } from '../dto/withdrawDto';
import { AddFavoriteResponse, FavoriteDto } from '../dto/favoriteDto';
import { TransactionResponse } from '../dto/transactionResponse';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageResponse } from 'src/aws/dto/uploadImage';

@Controller('auctions')
@ApiTags('경매 API') // Swagger Tage 설정
@ApiResponse({ status: 400, description : "REQUST PAYLOAD NOT PROPER" })
@ApiResponse({ status: 401, description : "AUTHORIAZATION FORBIDDEN" })
@ApiResponse({ status: 500, description : "INTERNAL SERVER ERR" })
export class AuctionController {
    constructor(
        private readonly auctionService : AuctionService
    ){}

    @ApiOperation({ summary : "관심목록 조회" })
    @CustomApiResponse(GetAuctionResponse)
    @UseGuards(JwtAuthGuard)
    @Role(2)
    @ApiBearerAuth('accesskey')
    @Get("/favorites")
    async getMyFavorites(@Req() req) {
        return await this.auctionService.getMyFavorites(req.user.id);
    }

    @ApiOperation({ summary : "Auction 생성" })
    @Role(2)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('accesskey')
    @CustomApiResponse(CreateAuctionResponse)
    @Post("/")
    async createAution(@Body() body : CreateAuctionDto, @Request() req) {
        return await this.auctionService.createAuction(body, req.user.id);
    }

    @ApiOperation({ summary : "Auction 페이징 조회" })
    @CustomApiResponse(GetAuctionResponse)
    @ApiParam({ name : "page" })
    @ApiParam({ name : "limit" })
    @Get("/:page/:limit")
    async getAuctions(@Param('page') page, @Param('limit') limit) {
        return await this.auctionService.getAuctions(Number(page), Number(limit));
    }

    @ApiOperation({ summary : "Auction 검색" })
    @CustomApiResponse(GetAuctionResponse)
    @ApiParam({ name : "word" })
    @ApiParam({ name : "page" })
    @ApiParam({ name : "limit" })
    @Get("/search/:word/:page/:limit")
    async searchAuction(@Param("word") word, @Param('page') page, @Param('limit') limit) {
        return await this.auctionService.searchAuction(word, Number(page), Number(limit));
    }
    
    @ApiOperation({ summary : "내가 쓴 Auction 조회" })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('accesskey')
    @Role(2)
    @CustomApiResponse(GetAuctionResponse)
    @ApiParam({ name : "page" })
    @ApiParam({ name : "limit" })
    @Get("/my/:page/:limit")
    async getMyAuctions(@Param('page') page, @Param('limit') limit, @Request() req) {
        return this.auctionService.getMyAuctions(Number(page), Number(limit), req.user.id);
    }

    @ApiOperation({ summary : "내가 참여한 Auction 조회" })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('accesskey')
    @Role(2)
    @CustomApiResponse(GetAuctionResponse)
    @ApiParam({ name : "page" })
    @ApiParam({ name : "limit" })
    @Get("/my/bids/:page/:limit")
    async getMyBids(@Param('page') page, @Param('limit') limit, @Request() req) {
        return this.auctionService.getMyBids(Number(page), Number(limit), req.user.id);
    }
    
    @ApiOperation({ summary : "입찰" })
    @Role(2)
    @UseGuards(JwtAuthGuard)
    @CustomApiResponse(TransactionResponse)
    @ApiBearerAuth('accesskey')
    @Post("/bid")
    async bid(@Body() body : BidDto, @Request() req) {
        return await this.auctionService.bid(body, req.user.id);
    }

    @ApiOperation({ summary : "옥션 상세 조회" })
    @CustomApiResponse(AuctionDetailResponse)
    @ApiParam({ name : "id" })
    @Get("/:id")
    async getAuctionRecord(@Param("id") auctionId) {
        return await this.auctionService.getAuctionRecord(Number(auctionId));
    }

    @ApiOperation({ summary : "입찰기록 가져오기" })
    @CustomApiResponse(GetBiddersResponse)
    @Post("/bidders")
    async getAuctionBidders(@Body() body : BidderDto) {
        return await this.auctionService.getBidders(body.contractAdrs)
    }

    @ApiOperation({ summary : "Seller 출금 (사전에 최종입찰자 서명 필요)"})
    @CustomApiResponse(TransactionResponse)
    @Role(2)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('accesskey')
    @Post("/withdraw/seller")
    async withdrawBySeller(@Body() body : WithdarwDto, @Request() req) {
        return await this.auctionService.withdrawBySeller(body, req.user.id);
    }

    @ApiOperation({ summary : "Emergency Withdraw 비상출금 [사고]"})
    @CustomApiResponse(TransactionResponse)
    @Role(2)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('accesskey')
    @Post("/withdraw/emergency")
    async emergencyWithdraw(@Body() body : WithdarwDto, @Request() req) {
        return await this.auctionService.emergencyWithdraw(body, req.user.id);
    }

    @ApiOperation({ summary : "관심목록에 추가 & 삭제 (있다면 삭제하고, 없다면 추가됨)" })
    @CustomApiResponse(AddFavoriteResponse)
    @UseGuards(JwtAuthGuard)
    @Role(2)
    @ApiBearerAuth('accesskey')
    @Post("/favorites")
    async handleFavorite(@Body() body : FavoriteDto, @Request() req) {
        return await this.auctionService.handleFavorites(body.auctionId, req.user.id);
    }

    @ApiOperation({ summary : "IPFS 이미지 업로드" })
    @Post('/ipfs/upload')
    @UseInterceptors(FileInterceptor('file', {
      limits : { fileSize : 10 * 1024 * 1024 },
      fileFilter : (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) { // jpg, jpeg, png 파일 유형만 허용
          cb(null, true);
        } else {
          cb(new BadRequestException('INVALID FILE TYPE'), false);
        }
      },
    }))

    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              format: 'binary',
            },
            auction : {
                type : 'number',
                format : 'number',
            }
          },
        },
    })
    @CustomApiResponse(UploadImageResponse)
    async uploadImage(@UploadedFile() file : any) {
        return await this.auctionService.uploadIpfs(file);
    }
}
