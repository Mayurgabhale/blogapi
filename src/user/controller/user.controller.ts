import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User, UserRole } from '../modules/user.interface';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { hasRoles } from 'src/auth/decorater/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuards } from 'src/auth/guards/roles.guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { UserIsUserGuard } from 'src/auth/guards/UserIsUser.guard';


export const storage = {
    storage: diskStorage({
        destination: './uploads/profileimages',
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
            const extension: string = path.parse(file.originalname).ext;
            cb(null, `${filename}${extension}`)

        }
    })
}


@Controller('users')
export class UserController {

    constructor(private userService: UserService) { }

    @Post()
    create(@Body() user: User): Observable<User | object> {
        return this.userService.create(user).pipe(
            map((user: User) => user),
            catchError(err => of({ error: err.message }))
        )
    }



    @Post('login')
    login(@Body() user: User): Observable<object> {
        return this.userService.login(user).pipe(
            switchMap((jwt: string) => {
                return this.userService.findbyMail(user.email).pipe(
                    map((userData: User) => {
                        return {
                            assess_token: jwt,
                            user: userData
                        };
                    })
                );
            })
        );
    }




    @Get(':id')
    findOne(@Param() params): Observable<User> {
        return this.userService.findOne(params.id);
    }

    // #################### ROLES CODE HERE START ####################

    // @hasRoles(UserRole.ADMIN)
    // @UseGuards(JwtAuthGuard, RolesGuards)

    // #################### ROLES CODE HERE END ####################


    @Get()
    index(@Query('page') page: number = 1, @Query('limit') limit: number = 10,): Observable<Pagination<User>> {
        limit = limit > 100 ? 100 : limit;
        return this.userService.paginate({ page: Number(page), limit: Number(limit), route: 'http://localhost:3000/users' });
    }

    // @hasRoles(UserRole.ADMIN)
    // @UseGuards(JwtAuthGuard, RolesGuards)
    @Delete(':id')
    deleteOne(@Param('id') id: string): Observable<any> {
        return this.userService.deleteOne(Number(id));
    }

    // @UseGuards(JwtAuthGuard, UserIsUserGuard)
    @Put(':id')
    updateOne(@Param('id') id: string, @Body() user: User): Observable<any> {
        return this.userService.updateOne(Number(id), user);
    }

    // @hasRoles(UserRole.ADMIN)
    // @UseGuards(JwtAuthGuard, RolesGuards)
    @Put(':id/role')
    updateRoleofUser(@Param('id') id: string, @Body() user: User): Observable<User> {
        return this.userService.updateRoleofUser(Number(id), user);
    }

    // @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', storage))
    uploadFile(@UploadedFile() file, @Request() req): Observable<Object> {
        // const user: User = req.user.user;
        const user: User = req.user;
        // console.log(user)
        return this.userService.updateOne(user.id, { profileImage: file.filename }).pipe(
            tap((user: User) => console.log(user)),
            map((user: User) => ({ profileImage: user.profileImage }))
        )
    }

    @Get('profile-image/:imagename')
    findProfileImage(@Param('imagename') imagename, @Res() res): Observable<Object> {
        return of(res.sendFile(join(process.cwd(), 'uploads/profileimages/' + imagename)));
    }



}
