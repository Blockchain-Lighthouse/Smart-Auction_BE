import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';
import { AwsService } from '../service/aws.service';
import { CustomApiResponse } from 'src/common/customApiResponse.decorator';
import { UploadImageResponse } from '../dto/uploadImage';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('AWS') // Swagger Tage 설정
@Controller('aws')
export class AwsController {
    constructor(
        private readonly AwsService : AwsService
    ) {}

    @ApiOperation({ summary : "S3 이미지 업로드 API - 단일" })
    @Post('/s3/upload')
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
          },
        },
    })
    @CustomApiResponse(UploadImageResponse)
    async uploadImage(@UploadedFile() file : any) {
        return await this.AwsService.uploadFile(file);
    }
}
