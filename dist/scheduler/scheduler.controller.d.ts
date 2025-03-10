import { SchedulerService } from './scheduler.service';
import { LoggerService } from '../shared/services/logger.service';
export declare class SchedulerController {
    private readonly schedulerService;
    private readonly logger;
    constructor(schedulerService: SchedulerService, logger: LoggerService);
    getScheduledJobs(): {
        libraryId: string;
        jobName: string;
        nextRun: Date;
    }[];
    scheduleLibraryScan(id: string, scheduleOptions?: {
        cronExpression?: string;
    }): Promise<{
        message: string;
        success: boolean;
    }>;
    triggerLibraryScan(id: string): Promise<{
        message: string;
    }>;
}
