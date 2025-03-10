import { StreamableFile } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Media } from '../media/entities/media.entity';
import { LoggerService } from '../shared/services/logger.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { ProgressService } from '../progress/progress.service';
export declare class StreamingService {
    private mediaRepository;
    private logger;
    private configService;
    private progressService;
    constructor(mediaRepository: Repository<Media>, logger: LoggerService, configService: ConfigService, progressService: ProgressService);
    streamMedia(mediaId: string, userId: string, response: Response, range?: string): Promise<StreamableFile | void>;
    getMediaInfo(mediaId: string, userId: string): Promise<any>;
    private getMimeType;
    getSubtitles(mediaId: string, userId: string): Promise<any[]>;
    getSubtitleFile(mediaId: string, subtitleFileName: string, userId: string, response: Response): Promise<StreamableFile>;
    private isSubtitleFile;
    private getSubtitleMimeType;
    private extractLanguageFromSubtitleFile;
    private getLanguageLabel;
}
