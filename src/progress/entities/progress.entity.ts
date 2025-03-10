import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Media } from '../../media/entities/media.entity';

@Entity()
export class Progress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Media, { onDelete: 'CASCADE' })
  media: Media;

  @Column('float')
  position: number; // Position in Sekunden

  @Column('float')
  duration: number; // Gesamtdauer in Sekunden

  @Column({ default: false })
  completed: boolean; // Ob das Video vollständig angesehen wurde

  @Column({ default: 0 })
  playCount: number;

  @Column({ nullable: true })
  lastPlayedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 