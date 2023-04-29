import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { CustomResponseType } from 'src/types/response';

export const CustomApiResponse = <T extends Type<any>>(data: T) => {
    return applyDecorators(
        ApiExtraModels(CustomResponseType, data),
        ApiOkResponse({
            schema : {
                allOf: [
                    { $ref : getSchemaPath(CustomResponseType) },
                    {
                        properties: {
                            statusCode : {
                                example : 201,
                                type : 'number',
                            },
                            payload : {
                              $ref : getSchemaPath(data) ,
                            }
                        }
                    }
                ]
            }
        })
    )
}