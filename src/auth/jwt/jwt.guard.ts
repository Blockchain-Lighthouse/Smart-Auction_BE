import { ForbiddenException, Injectable, UnauthorizedException, ExecutionContext, CanActivate } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
      private reflector : Reflector
    ) {
        super();
    }
    
    canActivate(context: ExecutionContext) : boolean | Promise<boolean> | Observable<boolean> {
      return super.canActivate(context);
    }

    // Role 검증
    handleRequest(err, user, info, context: ExecutionContext) {
      const apiRole = this.reflector.get<number>('role', context.getHandler());
      if(!user) {
        throw new UnauthorizedException;
      }
        
      if(apiRole > user.role) {
        throw new ForbiddenException;
      }

      return user;
    }
}