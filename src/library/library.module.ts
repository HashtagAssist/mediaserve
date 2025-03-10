import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { Library } from './entities/library.entity';
import { Media } from '../media/entities/media.entity';
import { MetadataModule } from '../metadata/metadata.module';
import { ThumbnailModule } from '../thumbnail/thumbnail.module';
import { CategoryModule } from '../category/category.module';
import { FileChangeModule } from '../file-change/file-change.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Library, Media]),
    MetadataModule,
    ThumbnailModule,
    CategoryModule,
    FileChangeModule,
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {} 