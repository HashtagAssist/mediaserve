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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Scheduler')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scheduler')
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
          id: { type: 'string' },
          name: { type: 'string' },
          nextRun: { type: 'string', format: 'date-time' },
          lastRun: { type: 'string', format: 'date-time', nullable: true },
          status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed'] },
        }
      }
    }
  })
  async getJobs() {
    this.logger.debug('Abrufen aller geplanten Jobs', 'SchedulerController');
    return this.schedulerService.getJobs();
  }

  @Post('jobs/:id/run')
  @ApiOperation({ summary: 'Job manuell ausführen' })
  @ApiParam({ name: 'id', description: 'Job-ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Job wurde gestartet' })
  @ApiResponse({ status: 404, description: 'Job nicht gefunden' })
  async runJob(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Manuelles Ausführen des Jobs ${id}`, 'SchedulerController');
    await this.schedulerService.runJob(id);
    return { message: 'Job gestartet' };
  }

  @Post('libraries/:id/scan')
  @ApiOperation({ summary: 'Bibliotheksscan manuell auslösen' })
  @ApiParam({ name: 'id', description: 'Bibliotheks-ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Scan wurde gestartet' })
  @ApiResponse({ status: 404, description: 'Bibliothek nicht gefunden' })
  async triggerLibraryScan(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Manueller Scan für Bibliothek ${id} ausgelöst`, 'SchedulerController');
    await this.schedulerService.scanLibrary(id);
    return { message: 'Scan gestartet' };
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
} 