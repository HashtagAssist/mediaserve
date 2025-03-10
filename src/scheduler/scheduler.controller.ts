import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../shared/services/logger.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Scheduler')
@Controller('scheduler')
@UseGuards(JwtAuthGuard)
export class SchedulerController {
  constructor(
    private readonly schedulerService: SchedulerService,
    private readonly logger: LoggerService,
  ) {}

  @Get('jobs')
  @ApiOperation({ summary: 'Alle geplanten Jobs abrufen' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste aller geplanten Jobs',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
          name: { type: 'string', example: 'Bibliothek scannen' },
          type: { type: 'string', example: 'library-scan' },
          schedule: { type: 'string', example: '0 0 * * *' },
          enabled: { type: 'boolean', example: true },
          lastRun: { 
            type: 'string', 
            format: 'date-time', 
            example: '2025-03-10T12:00:00Z',
            nullable: true 
          },
          nextRun: { 
            type: 'string', 
            format: 'date-time', 
            example: '2025-03-11T00:00:00Z' 
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  getScheduledJobs() {
    this.logger.debug('Rufe geplante Jobs ab', 'SchedulerController');
    return this.schedulerService.getScheduledJobs();
  }

  @Post('library/:id')
  @ApiOperation({ summary: 'Bibliotheksscan planen' })
  @ApiParam({ name: 'id', description: 'ID der Bibliothek', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cronExpression: { 
          type: 'string', 
          example: '0 0 * * *',
          description: 'Cron-Ausdruck für die Planung (optional)'
        }
      },
      required: []
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Scan erfolgreich geplant',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Scan erfolgreich geplant' },
        success: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Bibliothek nicht gefunden' })
  async scheduleLibraryScan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() scheduleOptions?: { cronExpression?: string },
  ) {
    this.logger.debug(
      `Plane Scan für Bibliothek ${id} ${scheduleOptions?.cronExpression ? `(${scheduleOptions.cronExpression})` : ''}`,
      'SchedulerController'
    );
    
    const success = await this.schedulerService.scheduleLibraryScan(id, scheduleOptions?.cronExpression);
    
    return { 
      message: success 
        ? 'Scan erfolgreich geplant' 
        : 'Scan konnte nicht geplant werden',
      success,
    };
  }

  @Post('scan/library/:id')
  @ApiOperation({ summary: 'Manuellen Bibliotheksscan auslösen' })
  @ApiParam({ name: 'id', description: 'ID der Bibliothek', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Scan gestartet',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Scan gestartet' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Bibliothek nicht gefunden' })
  async triggerLibraryScan(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Manueller Scan für Bibliothek ${id} ausgelöst`, 'SchedulerController');
    await this.schedulerService.scanLibrary(id);
    return { message: 'Scan gestartet' };
  }
} 