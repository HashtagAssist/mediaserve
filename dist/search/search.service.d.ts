import { Repository } from 'typeorm';
import { Media } from '../media/entities/media.entity';
import { LoggerService } from '../shared/services/logger.service';
export interface SearchOptions {
    query?: string;
    type?: 'movie' | 'music' | string[];
    genres?: string[];
    year?: number | {
        min?: number;
        max?: number;
    };
    duration?: {
        min?: number;
        max?: number;
    };
    libraryId?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export interface SearchResult {
    items: Media[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export declare class SearchService {
    private mediaRepository;
    private logger;
    constructor(mediaRepository: Repository<Media>, logger: LoggerService);
    search(options: SearchOptions): Promise<SearchResult>;
    suggest(query: string, limit?: number): Promise<string[]>;
}
