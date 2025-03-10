import { Repository } from 'typeorm';
import { Library } from './entities/library.entity';
import { Media } from '../media/entities/media.entity';
import { MetadataService } from '../metadata/metadata.service';
import { LoggerService } from '../shared/services/logger.service';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { ThumbnailService } from '../thumbnail/thumbnail.service';
import { CategoryService } from '../category/category.service';
import { FileChangeService } from '../file-change/file-change.service';
interface LibraryStats {
    totalFiles: number;
    processedFiles: number;
    byType: {
        movie: number;
        music: number;
    };
    totalSize: number;
    lastScanned: Date | null;
}
export declare class LibraryService {
    private libraryRepository;
    private mediaRepository;
    private metadataService;
    private logger;
    private thumbnailService;
    private categoryService;
    private fileChangeService;
    constructor(libraryRepository: Repository<Library>, mediaRepository: Repository<Media>, metadataService: MetadataService, logger: LoggerService, thumbnailService: ThumbnailService, categoryService: CategoryService, fileChangeService: FileChangeService);
    create(createLibraryDto: CreateLibraryDto): Promise<Library>;
    scanLibrary(id: string, options?: {
        recursive?: boolean;
        maxDepth?: number;
        incrementalScan?: boolean;
    }): Promise<void>;
    private performFullScan;
    private performIncrementalScan;
    private processNewMedia;
    findAll(): Promise<Library[]>;
    findOne(id: string): Promise<Library>;
    remove(id: string): Promise<void>;
    update(id: string, updateLibraryDto: UpdateLibraryDto): Promise<Library>;
    getStats(id: string): Promise<LibraryStats>;
}
export {};
