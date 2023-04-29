import { Module } from '@nestjs/common';
import { AwsService } from './service/aws.service';
import { AwsController } from './controller/aws.controller';

@Module({
  providers: [
    AwsService
  ],
  controllers: [AwsController],
  exports: [AwsService]
})
export class AwsModule {}
