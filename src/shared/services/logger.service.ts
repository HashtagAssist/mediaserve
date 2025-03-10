import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    const logsDir = this.configService.get<string>('LOGS_DIR', 'logs');
    const environment = this.configService.get<string>('NODE_ENV', 'development');

    // Erstelle ein angepasstes Format für die Logs
    const customFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ level, message, timestamp, context, trace, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}] `;
        if (context) {
          log += `[${context}] `;
        }
        log += message;
        if (trace) {
          log += `\n${trace}`;
        }
        if (Object.keys(meta).length > 0) {
          log += `\n${JSON.stringify(meta, null, 2)}`;
        }
        return log;
      })
    );

    // Konfiguriere die Transports basierend auf der Umgebung
    const transports: winston.transport[] = [
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        format: customFormat,
      }),
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        format: customFormat,
      }),
    ];

    // Füge Console-Transport nur in Entwicklungsumgebung hinzu
    if (environment !== 'production') {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            customFormat
          ),
        })
      );
    }

    this.logger = winston.createLogger({
      level: environment === 'production' ? 'info' : 'debug',
      format: customFormat,
      transports,
      // Aktiviere Exception-Handling
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logsDir, 'exceptions.log'),
          format: customFormat,
        }),
      ],
      // Aktiviere Rejection-Handling
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(logsDir, 'rejections.log'),
          format: customFormat,
        }),
      ],
    });
  }

  log(message: string, context?: string, meta?: any) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: any) {
    this.logger.error(message, { trace, context, ...meta });
  }

  warn(message: string, context?: string, meta?: any) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: any) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: any) {
    this.logger.verbose(message, { context, ...meta });
  }
} 