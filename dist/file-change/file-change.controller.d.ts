import { FileChangeService } from './file-change.service';
import { LoggerService } from '../shared/services/logger.service';
export declare class FileChangeController {
    private readonly fileChangeService;
    private readonly logger;
    constructor(fileChangeService: FileChangeService, logger: LoggerService);
    findAll(status?: string, type?: string): Promise<{
        total: number;
        items: import("./entities/file-change.entity").FileChange[];
    }>;
    findOne(id: string): any;
    detectChanges(id: string): any;
    process(id: string): any;
}
