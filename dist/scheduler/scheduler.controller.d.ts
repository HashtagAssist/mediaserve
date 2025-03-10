import { SchedulerService } from './scheduler.service';
import { LoggerService } from '../shared/services/logger.service';
export declare class SchedulerController {
    private readonly schedulerService;
    private readonly logger;
    constructor(schedulerService: SchedulerService, logger: LoggerService);
    getJobs(): Promise<any>;
    runJob(id: string): Promise<{
        message: string;
    }>;
    triggerLibraryScan(id: string): Promise<{
        message: string;
    }>;
    scheduleLibraryScan(id: string, scheduleOptions?: {
        cronExpression?: string;
    }): Promise<{
        message: string;
        success: boolean;
    }>;
}
