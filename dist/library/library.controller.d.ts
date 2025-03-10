import { LibraryService } from './library.service';
import { LoggerService } from '../shared/services/logger.service';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { LibraryStats, Library } from './entities/library.entity';
export declare class LibraryController {
    private readonly libraryService;
    private readonly logger;
    constructor(libraryService: LibraryService, logger: LoggerService);
    create(createLibraryDto: CreateLibraryDto): Promise<Library>;
    findAll(): Promise<Library[]>;
    findOne(id: string): Promise<Library>;
    update(id: string, updateLibraryDto: UpdateLibraryDto): Promise<Library>;
    scan(id: string, scanOptions?: {
        recursive?: boolean;
        maxDepth?: number;
        incrementalScan?: boolean;
    }): Promise<{
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getStats(id: string): Promise<LibraryStats>;
}
