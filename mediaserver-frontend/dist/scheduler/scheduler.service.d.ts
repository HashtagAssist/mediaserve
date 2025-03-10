import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Library } from '../library/entities/library.entity';
import { LibraryService } from '../library/library.service';
import { LoggerService } from '../shared/services/logger.service';
import { ConfigService } from '@nestjs/config';
export declare class SchedulerService implements OnModuleInit {
    private libraryRepository;
    private libraryService;
    private schedulerRegistry;
    private logger;
    private configService;
    private readonly scanningLibraries;
    private readonly scheduledJobs;
    constructor(libraryRepository: Repository<Library>, libraryService: LibraryService, schedulerRegistry: SchedulerRegistry, logger: LoggerService, configService: ConfigService);
    onModuleInit(): Promise<void>;
    private setupScheduledJobs;
    scheduleLibraryScan(libraryId: string, cronExpression?: string): Promise<boolean>;
    scanLibrary(libraryId: string): Promise<void>;
    cleanupThumbnails(): Promise<void>;
    getScheduledJobs(): {
        libraryId: string;
        jobName: string;
        nextRun: Date;
    }[];
    private getNextExecutionTime;
}
