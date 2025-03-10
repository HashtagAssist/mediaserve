import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Library } from '../../library/entities/library.entity';

@Entity()
export class FileChange {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  path: string;

  @Column()
  type: string; // 'added', 'modified', 'deleted'

  @Column({ default: 'pending' })
  status: string; // 'pending', 'processed', 'failed'

  @Column({ nullable: true })
  errorMessage: string;

  @ManyToOne(() => Library)
  @JoinColumn()
  library: Library;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 