import { MetadataService } from './metadata.service';
import { LoggerService } from '../shared/services/logger.service';
export declare class MetadataController {
    private readonly metadataService;
    private readonly logger;
    constructor(metadataService: MetadataService, logger: LoggerService);
    getMediaMetadata(mediaId: string): Promise<any>;
    fetchMetadata(mediaId: string, source?: string): Promise<any>;
    updateMetadata(mediaId: string, metadataDto: any): Promise<{
        message: string;
    }>;
    extractMetadata(id: string): Promise<import("../media/entities/media.entity").Media>;
    analyzeDirectory(directoryPath: string): Promise<any[]>;
}
