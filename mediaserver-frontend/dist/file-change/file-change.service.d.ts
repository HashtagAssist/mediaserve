import { Repository } from 'typeorm';
import { Media } from '../media/entities/media.entity';
import { LoggerService } from '../shared/services/logger.service';
import { FileChange } from './entities/file-change.entity';
import { Library } from '../library/entities/library.entity';
interface FileChangeResult {
    added: string[];
    modified: string[];
    deleted: string[];
}
export declare class FileChangeService {
    private mediaRepository;
    private fileChangeRepository;
    private libraryRepository;
    private logger;
    constructor(mediaRepository: Repository<Media>, fileChangeRepository: Repository<FileChange>, libraryRepository: Repository<Library>, logger: LoggerService);
    detectChanges(libraryId: string, directoryPath: string): Promise<FileChangeResult>;
    private scanDirectory;
    private isFileModified;
    private calculateFileHash;
    updateFileHash(mediaId: string): Promise<void>;
    findAll(limit?: number, offset?: number, type?: string, status?: string): Promise<{
        total: number;
        items: FileChange[];
    }>;
    processChanges(libraryId?: string): Promise<{
        processed: number;
        failed: number;
    }>;
}
export {};
