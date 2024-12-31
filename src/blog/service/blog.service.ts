import { Injectable, NotFoundException } from '@nestjs/common';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { BlogEntry } from '../model/blog.entry.interface';
import { User } from 'src/user/modules/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntryEntity } from '../model/blog-entry.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/service/user.service';
import slugify from 'slugify';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class BlogService {

    constructor(
        @InjectRepository(BlogEntryEntity) private readonly blogRepository: Repository<BlogEntry>,
        private userServicr: UserService
    ) { }



    create(user: User, blogEntry: BlogEntry): Observable<BlogEntry> {
        blogEntry.author = user;
        return this.generateSlug(blogEntry.title).pipe(
            switchMap((slug: string) => {
                blogEntry.slug = slug;
                return from(this.blogRepository.save(blogEntry))
            })
        )
    }

   


    findOne(id: number): Observable<BlogEntry> {
        return from(
            this.blogRepository.findOne({
                where: { id },
                relations: ['author'], 
            }),
        ).pipe(
            map((blog: BlogEntry) => {
                if (!blog) {
                    throw new NotFoundException(`Blog entry with ID ${id} not found.`);
                }
                return blog;
            }),
        );
    }




    findAll(): Observable<BlogEntry[]> {
        return from(this.blogRepository.find({ relations: ['author'] }));
    }

    paginateAll(option:IPaginationOptions):Observable<Pagination<BlogEntry>>{
        return from(paginate<BlogEntry>(this.blogRepository,option,{
            relations:['author']
        })).pipe(
            map((blogEntries:Pagination<BlogEntry>) => blogEntries)
        )
    } 

    paginateByUser(option: IPaginationOptions, userId: number): Observable<Pagination<BlogEntry>> {
        return from(paginate<BlogEntry>(this.blogRepository, option, {
            relations: ['author'],
            where: {
                author: { id: userId }, 
            },
        })).pipe(
            map((blogEntries: Pagination<BlogEntry>) => blogEntries)
        );
    }
    

    findByUser(userId: number): Observable<BlogEntry[]> {
        return from(this.blogRepository.find({
            where: { author: { id: userId } },
            relations: ['author']
        })).pipe(
            map((blogEntries: BlogEntry[]) => blogEntries))
    }


    updateOne(id: number, blogEntry: BlogEntry): Observable<BlogEntry> {
        return from(this.blogRepository.update(id, blogEntry)).pipe(
            switchMap(() => this.findOne(id))
        )
    }



    deleteOne(id: number): Observable<any> {
        return from(this.blogRepository.findOne({ where: { id } })).pipe( // Use 'where' clause to specify the id
            switchMap((blogEntry) => {
                if (!blogEntry) {
                    throw new NotFoundException(`Blog entry with ID ${id} not found.`);
                }
                return from(this.blogRepository.delete(id)); // Ensure 'delete' is wrapped in 'from'
            })
        );
    }
    


    generateSlug(title: string): Observable<string> {
        return of(slugify(title));
    }





}
