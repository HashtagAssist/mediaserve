import { Repository } from 'typeorm';
import { Media } from '../media/entities/media.entity';
import { Library } from '../library/entities/library.entity';
import { LoggerService } from '../shared/services/logger.service';
import { ConfigService } from '@nestjs/config';
import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
export declare class ThumbnailService {
    private mediaRepository;
    private libraryRepository;
    private logger;
    private configService;
    private readonly thumbnailsDir;
    private readonly ffmpegAvailable;
    constructor(mediaRepository: Repository<Media>, libraryRepository: Repository<Library>, logger: LoggerService, configService: ConfigService);
    private ensureThumbnailDir;
    getThumbnail(mediaId: string, res: Response): Promise<StreamableFile>;
    generateThumbnail(mediaId: string): Promise<string>;
    saveThumbnail(mediaId: string, file: any): Promise<string>;
    generateThumbnailsForLibrary(libraryId: string): Promise<number>;
}
