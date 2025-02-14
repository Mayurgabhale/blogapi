import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { map, Observable } from "rxjs";
import { User } from "src/user/modules/user.interface";
import { UserService } from "src/user/service/user.service";


//################# ROLES CODE #######################
 



// @Injectable()
// export class RolesGuards implements CanActivate{
//     constructor(private reflector:Reflector,
//         @Inject(forwardRef(()=>UserService))
//         private userService:UserService){}

//     canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
//         const roles = this.reflector.get<string[]>('roles',context.getHandler());

//         if(!roles){
//             return true;
//         }

//         const request = context.switchToHttp().getRequest();
//         // const user:User = request.user.user;
//         const user:User = request.user;

//         return this.userService.findOne(user.id).pipe(
//             map((user:User)=>{
//                 const hasRole = () => roles.indexOf(user.role) > -1;
//                 let hasPermission: boolean = false;
//                 console.log(hasRole);

//                 if(hasRole()) {
//                     // console.log('has role true')
//                     hasPermission = true};
//                     return user && hasPermission;
//                 }
//             )
//         )


        
//     }
// }



// -----------

@Injectable()
export class RolesGuards implements CanActivate {
    constructor(
        private reflector: Reflector,

        @Inject(forwardRef(() => UserService))
        private userService: UserService
    ) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: User = request.user;

        return this.userService.findOne(user.id).pipe(
            map((user: User) => {
                const hasRole = () => roles.indexOf(user.role) > -1;
                let hasPermission: boolean = false;

                if (hasRole()) {
                    hasPermission = true;
                };
                return user && hasPermission;
            })
        )
    }
}