import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Media } from '../media/entities/media.entity';
import { LoggerService } from '../shared/services/logger.service';
import { ConfigService } from '@nestjs/config';
interface AnalyzeOptions {
    recursive?: boolean;
    maxDepth?: number;
    includeHidden?: boolean;
}
export declare class MetadataService implements OnModuleInit {
    private mediaRepository;
    private logger;
    private configService;
    private readonly supportedFormats;
    private ffmpegAvailable;
    constructor(mediaRepository: Repository<Media>, logger: LoggerService, configService: ConfigService);
    onModuleInit(): Promise<void>;
    extractMetadata(mediaId: string): Promise<Media>;
    private getFFmpegMetadata;
    private updateMediaMetadata;
    analyzeDirectory(directoryPath: string, options?: AnalyzeOptions): Promise<any[]>;
    private findMediaFiles;
    private getMediaType;
    getMediaMetadata(mediaId: string): Promise<any>;
    fetchMetadata(mediaId: string, source?: string): Promise<any>;
    updateMetadata(mediaId: string, metadataDto: any): Promise<void>;
}
export {};
