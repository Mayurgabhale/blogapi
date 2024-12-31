import { UserEntity } from "src/user/modules/user.entity";
import { BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('blog_entry')
export class BlogEntryEntity{

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    title:string;

    @Column()
    slug: string;

    @Column()
    description:string;

    @Column({type:'timestamp', default:() => "CURRENT_TIMESTAMP"})
    createdAt:Date;

    @Column({type:'timestamp', default:() => "CURRENT_TIMESTAMP"})
    updatedAt:Date;

    @BeforeUpdate()
    updateTimestamp(){
        this.updatedAt = new Date;
    }

   

    @ManyToOne(() => UserEntity, (user) => user.blogEntries, { onDelete: 'CASCADE' })
    author: UserEntity;
}
