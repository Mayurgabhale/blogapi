import { Injectable } from '@nestjs/common';
import { UserEntity } from '../modules/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { User, UserRole } from '../modules/user.interface';
import { AuthService } from 'src/auth/services/auth.service';
import {paginate,Pagination,IPaginationOptions} from 'nestjs-typeorm-paginate';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        private authService:AuthService
    ){}

    create(user:User):Observable<User>{
        return this.authService.hashPassword(user.password).pipe(
            switchMap((passwordHash:string) => {
                const newUser = new UserEntity();
                newUser.name = user.name;
                newUser.username = user.username;
                newUser.email = user.email;
                newUser.password = passwordHash;
                newUser.role = UserRole.USER;
                return from(this.userRepository.save(newUser)).pipe(
                    map((user:User)=>{
                        const {password, ...result} = user;
                        return result;
                    }),
                    catchError(err => throwError(err))
                )
            })
        )

    }

    findOne(id:number):Observable<User>{
        return from(this.userRepository.findOne({where:{id}})).pipe(
            map((user:User)=>{
                // console.log(user)
                const {password, ...result} = user;
                return result;
            })
        )
        
    }

    findAll():Observable<User[]>{
        return from(this.userRepository.find()).pipe(
            map((users)=>{
                users.forEach(function (v) {delete v.password});
                return users;
            })
        )
    }


    // paginate(options:IPaginationOptions):Observable<Pagination<User>>{
    //     return from(paginate<User>(this.userRepository,options)).pipe(
    //         map((userPageable:Pagination<User>)=>{
    //             userPageable.items.forEach(function (v) {delete v.password});

    //             return userPageable;
    //         })
    //     )
    // }

    paginate(options: IPaginationOptions): Observable<Pagination<User>> {
        return from(paginate<UserEntity>(this.userRepository, options)).pipe(
            map((userPageable: Pagination<UserEntity>) => {
                // Map over the items and remove the password field
                userPageable.items.forEach((v) => {
                    const { password, ...userWithoutPassword } = v;
                    Object.assign(v, userWithoutPassword);  // Remove password from the entity
                });
    
                // Return the Pagination object with the user items now containing no password
                return userPageable as Pagination<User>;
            })
        );
    }
    


    deleteOne(id:number):Observable<any>{
        return from(this.userRepository.delete(id));
    }

    updateOne(id:number, user:User):Observable<any>{
        delete user.email;
        delete user.password;
        // 
        delete user.role;

        return from(this.userRepository.update(id,user)).pipe(
            switchMap(() => this.findOne(id))
        )
    }

    updateRoleofUser(id:number,user:User):Observable<any>{
        return from(this.userRepository.update(id,user))
    }

    login(user:User):Observable<string>{
        return this.validateUser(user.email, user.password).pipe(
            switchMap((user:User)=>{
                if(user){
                    return this.authService.generateJWT(user).pipe(map((jwt:string) => jwt));
                }else{
                    return 'Wrong Creadentials...'
                }
            })
        )
    }

    // validateUser(email:string, password:string):Observable<User>{
    //     return this.findbyMail(email).pipe(
    //         switchMap((user:User)=> this.authService.comparePasswords(password, user.password).pipe(
    //             map((match: boolean) =>{
    //                 if(match){
    //                     const {password, ...result} = user;
    //                     return result
    //                 }else{
    //                     throw Error;
    //                 }
    //             })
    //         ))
    //     )
    // } // this is main 

    validateUser(email: string, password: string): Observable<User> {
        return from(
            this.userRepository.findOne({
                where: { email },
                select: ['id', 'password', 'name', 'username', 'email', 'role', 'profileImage'],
            })
        ).pipe(
            switchMap((user: User) =>
                this.authService.comparePasswords(password, user.password).pipe(
                    map((match: boolean) => {
                        if (match) {
                            const { password, ...result } = user;
                            return result;
                        } else {
                            throw new Error('Invalid credentials');
                        }
                    })
                )
            )
        );
    }
    

    findbyMail(email:string):Observable<User>{
        return from(this.userRepository.findOne({where:{email}}));
    }


}
