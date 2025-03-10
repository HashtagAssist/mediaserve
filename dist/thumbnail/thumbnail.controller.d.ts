import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { ThumbnailService } from './thumbnail.service';
import { LoggerService } from '../shared/services/logger.service';
export declare class ThumbnailController {
    private readonly thumbnailService;
    private readonly logger;
    constructor(thumbnailService: ThumbnailService, logger: LoggerService);
    getThumbnail(mediaId: string, res: Response): Promise<StreamableFile>;
    generateThumbnail(mediaId: string): Promise<{
        message: string;
        thumbnailPath: string;
    }>;
    uploadThumbnail(mediaId: string, file: any): Promise<{
        message: string;
        thumbnailPath: string;
    }>;
    generateThumbnailsForLibrary(libraryId: string): Promise<{
        message: string;
        generated: number;
    }>;
}
