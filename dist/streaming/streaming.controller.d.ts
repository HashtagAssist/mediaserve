import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { StreamingService } from './streaming.service';
import { LoggerService } from '../shared/services/logger.service';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
export declare class StreamingController {
    private readonly streamingService;
    private readonly logger;
    constructor(streamingService: StreamingService, logger: LoggerService);
    streamMedia(id: string, req: RequestWithUser, res: Response, range?: string): Promise<StreamableFile | void>;
    getMediaInfo(req: any, id: string): Promise<any>;
    getSubtitles(req: any, id: string): Promise<any[]>;
    getSubtitleFile(req: RequestWithUser, res: Response, id: string, fileName: string): Promise<StreamableFile>;
}
