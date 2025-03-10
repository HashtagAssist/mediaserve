import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { MediaType } from '../enums/media-type.enum';
import { Library } from '../../library/entities/library.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../category/entities/category.entity';

@Entity()
export class Media {
  @ApiProperty({ 
    description: 'Eindeutige ID des Mediums', 
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ 
    description: 'Titel des Mediums', 
    example: 'Beispielvideo' 
  })
  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  path: string;

  @Column({ nullable: true })
  relativePath: string;

  @Column({ type: 'enum', enum: MediaType, default: MediaType.MOVIE })
  type: MediaType;

  @Column({ nullable: true })
  duration: number;

  @Column({ default: false })
  processed: boolean;

  @Column({ nullable: true })
  fileHash: string;

  @Column({ nullable: true })
  thumbnailPath: string;

  @Column({ nullable: true })
  releaseYear: number;

  @Column({ nullable: true })
  director: string;

  @Column('simple-array', { nullable: true })
  actors: string[];

  @Column('simple-array', { nullable: true })
  genres: string[];

  @Column({ nullable: true })
  language: string;

  @ManyToOne(() => Library, library => library.media)
  @JoinColumn()
  library: Library;

  @ManyToMany(() => Category, category => category.media)
  categories: Category[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ nullable: true })
  format?: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize?: number;

  @Column({ nullable: true })
  resolution?: string;

  @Column({ nullable: true })
  codec?: string;

  @Column({ nullable: true })
  frameRate?: string;

  @Column({ nullable: true })
  audioCodec?: string;

  @Column({ type: 'int', nullable: true })
  audioChannels?: number;

  @Column({ nullable: true })
  sampleRate?: string;

  @Column({ type: 'float', default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  ratingCount: number;
} 