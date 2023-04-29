import * as AWS from 'aws-sdk';
import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UploadImageResponse } from '../dto/uploadImage';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

@Injectable()
export class AwsService {
    async uploadFile(file : any) : Promise<UploadImageResponse> {
        const region = "ap-northeast-2"
        
        try {
            if (!file.originalname) {
                throw new BadRequestException("FILE NOT EXIST");
            }
            
            const name = `${Date.now() + file.originalname}`;

            // AWS Configuration
            AWS.config.update({
                region,
                credentials: {
                    accessKeyId: process.env.AWS_KEY,
                    secretAccessKey: process.env.AWS_SECRET,
                },
            });;

            const upload = await new AWS.S3()
                .putObject({
                    Key : name,
                    Body : file.buffer,
                    Bucket : "blockchain-lighthouse/auction/users",
                    ContentType : file.mimetype,
                    ACL : "public-read"
                })
                .promise();

            console.log(upload);
            
            return {
                path : `https://blockchain-lighthouse.s3.${region}.amazonaws.com/auction/users/${name}`
            };

        } catch(e) {
            throw new HttpException(e, 400);
        }
    }

    // # Send SES Email
    async sendSesEmail(
        emailTo : string, 
        title : string, 
        content : string
    ) {
        const sesClient = new SESClient({
            region : "ap-northeast-2",
            credentials: {
                accessKeyId : process.env.AWS_KEY,
                secretAccessKey : process.env.AWS_SECRET
            }
        })
        const command = new SendEmailCommand({
            Destination: {
              //목적지
              CcAddresses: [],
              ToAddresses: [emailTo], // 받을 사람의 이메일
            },
            Message: {
              Body: { // 이메일 본문 내용
                Text: {
                  Charset: 'UTF-8',
                  Data: content,
                },
              },
              Subject: { // 이메일 제목
                Charset: 'UTF-8',
                Data: title,
              },
            },
            Source: 'lighthouse@no-reply.bclh.link', // 보내는 사람의 이메일 - 무조건 Verfied된 identity여야 함
            ReplyToAddresses: [],
        });

        try {
            await sesClient.send(command);
        } catch (e) {
            throw new HttpException(e, 400);
        }
    }
}
