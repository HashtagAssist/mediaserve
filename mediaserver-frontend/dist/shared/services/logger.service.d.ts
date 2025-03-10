import { LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class LoggerService implements NestLoggerService {
    private configService;
    private logger;
    constructor(configService: ConfigService);
    log(message: string, context?: string, meta?: any): void;
    error(message: string, trace?: string, context?: string, meta?: any): void;
    warn(message: string, context?: string, meta?: any): void;
    debug(message: string, context?: string, meta?: any): void;
    verbose(message: string, context?: string, meta?: any): void;
}
