import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Media } from '../../media/entities/media.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Playlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  isPublic: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner: User;

  @ManyToMany(() => Media)
  @JoinTable()
  items: Media[];

  @Column({ default: 0 })
  itemCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 