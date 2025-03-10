import { SearchService } from './search.service';
import { LoggerService } from '../shared/services/logger.service';
export declare class SearchController {
    private readonly searchService;
    private readonly logger;
    constructor(searchService: SearchService, logger: LoggerService);
    search(query?: string, type?: string, genres?: string, yearMin?: number, yearMax?: number, durationMin?: number, durationMax?: number, libraryId?: string, limit?: number, offset?: number, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Promise<import("./search.service").SearchResult>;
    suggest(query: string, limit: number): Promise<string[]>;
}
