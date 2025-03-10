import { Request as ExpressRequest } from 'express';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { Progress } from './entities/progress.entity';
import { LoggerService } from '../shared/services/logger.service';
interface RequestWithUser extends ExpressRequest {
    user: {
        id: string;
    };
}
export declare class ProgressController {
    private readonly progressService;
    private readonly loggerService;
    private readonly logger;
    constructor(progressService: ProgressService, loggerService: LoggerService);
    create(req: RequestWithUser, createProgressDto: CreateProgressDto): Promise<{
        message: string;
        progress: Progress;
    }>;
    findAll(req: RequestWithUser): Promise<Progress[]>;
    findContinueWatching(req: RequestWithUser, limit?: number): Promise<Progress[]>;
    findOne(req: RequestWithUser, mediaId: string): Promise<Progress | {
        message: string;
    }>;
    remove(req: RequestWithUser, mediaId: string): Promise<{
        message: string;
    }>;
    update(req: RequestWithUser, mediaId: string, updateProgressDto: UpdateProgressDto): Promise<{
        message: string;
        progress: Progress;
    }>;
    getProgress(mediaId: string, req: any): Promise<Progress>;
    updateProgress(mediaId: string, updateProgressDto: UpdateProgressDto, req: any): Promise<Progress>;
    getAllProgress(req: any): Promise<Progress[]>;
    getContinueWatching(req: any): Promise<Progress[]>;
}
export {};
