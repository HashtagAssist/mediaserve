import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileChangeController } from './file-change.controller';
import { FileChangeService } from './file-change.service';
import { FileChange } from './entities/file-change.entity';
import { Media } from '../media/entities/media.entity';
import { Library } from '../library/entities/library.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileChange, Media, Library]),
    SharedModule,
  ],
  controllers: [FileChangeController],
  providers: [FileChangeService],
  exports: [FileChangeService],
})
export class FileChangeModule {} 