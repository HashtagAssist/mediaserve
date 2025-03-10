import { FileChangeService } from './file-change.service';
import { LoggerService } from '../shared/services/logger.service';
export declare class FileChangeController {
    private readonly fileChangeService;
    private readonly logger;
    constructor(fileChangeService: FileChangeService, logger: LoggerService);
    findAll(limit: number, offset: number, type?: string, status?: string): Promise<{
        total: number;
        items: import("./entities/file-change.entity").FileChange[];
    }>;
    processChanges(body: {
        libraryId?: string;
    }): Promise<{
        processed: number;
        failed: number;
        message: string;
    }>;
}
