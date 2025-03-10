import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetadataService } from './metadata.service';
import { MetadataController } from './metadata.controller';
import { Media } from '../media/entities/media.entity';
import { LoggerService } from '../shared/services/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Media])],
  providers: [MetadataService, LoggerService],
  controllers: [MetadataController],
  exports: [MetadataService],
})
export class MetadataModule {} 