import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThumbnailController } from './thumbnail.controller';
import { ThumbnailService } from './thumbnail.service';
import { Media } from '../media/entities/media.entity';
import { Library } from '../library/entities/library.entity';
import { SharedModule } from '../shared/shared.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media, Library]),
    SharedModule,
    ConfigModule,
  ],
  controllers: [ThumbnailController],
  providers: [ThumbnailService],
  exports: [ThumbnailService],
})
export class ThumbnailModule {} 