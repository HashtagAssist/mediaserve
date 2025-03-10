import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Media } from '../../media/entities/media.entity';

@Entity()
export class Library {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  path: string;

  @Column({ default: false })
  autoScan: boolean;

  @Column({ nullable: true })
  scanSchedule?: string;

  @Column({ nullable: true })
  lastScanned?: Date;

  @OneToMany(() => Media, media => media.library)
  media: Media[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export interface LibraryStats {
  totalFiles: number;
  processedFiles: number;
  byType: {
    movie: number;
    music: number;
  };
  totalSize: number;
  lastScanned: Date | null;
} 