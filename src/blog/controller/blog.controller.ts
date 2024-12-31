import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { BlogService } from '../service/blog.service';
import { Observable } from 'rxjs';
import { BlogEntry } from '../model/blog.entry.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { UserIsAuthorGuard } from '../guards/user-is-author.guard';

export const BLOG_ENTRIES_URL = 'http://localhost:3000/api/blogs';

@Controller('blogs')
export class BlogController {

    constructor(private blogService: BlogService) { }

    // @UseGuards(UserIsAuthorGuard)
    @Post()
    create(@Body() blogEntry: BlogEntry, @Request() req): Observable<BlogEntry> {
        const user = req.user;
        return this.blogService.create(user, blogEntry);
    }

    


  

    @Get('')
    index(
        @Query('page') page:number = 1,
        @Query('limit') limit:number = 10
    ){
        limit = limit > 100 ? 100 : limit;

        return this.blogService.paginateAll({
            limit:Number(limit),
            page:Number(page),
            route:BLOG_ENTRIES_URL
        })
    }

    @Get('user/:user')
    indexByUser(
        @Query('page') page:number = 1,
        @Query('limit') limit:number = 10,
        @Param('user') userId:number
    ){
        limit = limit > 100 ? 100 : limit;

        return this.blogService.paginateByUser({
            limit:Number(limit),
            page:Number(page),
            route:BLOG_ENTRIES_URL
        },Number(userId))
    }


    @Get(':id')
    findOne(@Param('id') id: number): Observable<BlogEntry> {
        return this.blogService.findOne(id);
    }


    // @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
    @Put(':id')
    updateOne(@Param('id') id: number, @Body() blogEntry: BlogEntry): Observable<BlogEntry> {
        return this.blogService.updateOne(Number(id), blogEntry)
    }


    // @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
    @Delete(':id')
    deleteOne(@Param('id') id: number): Observable<any> {
        if (!id) {
            throw new BadRequestException('ID parameter is required');
        }
        return this.blogService.deleteOne(id);
    }





}
