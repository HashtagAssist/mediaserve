import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileChangeService } from './file-change.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../shared/services/logger.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('File Changes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('file-changes')
export class FileChangeController {
  constructor(
    private readonly fileChangeService: FileChangeService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Alle Dateiänderungen abrufen' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'processed', 'failed'] })
  @ApiQuery({ name: 'type', required: false, enum: ['added', 'modified', 'deleted'] })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste aller Dateiänderungen',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          path: { type: 'string' },
          type: { type: 'string', enum: ['added', 'modified', 'deleted'] },
          status: { type: 'string', enum: ['pending', 'processed', 'failed'] },
          errorMessage: { type: 'string', nullable: true },
          library: { 
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        }
      }
    }
  })
  findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    this.logger.debug('Abrufen aller Dateiänderungen', 'FileChangeController');
    return this.fileChangeService.findAll(status, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dateiänderung nach ID abrufen' })
  @ApiParam({ name: 'id', description: 'Dateiänderungs-ID', type: 'string', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dateiänderung gefunden',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        path: { type: 'string' },
        type: { type: 'string', enum: ['added', 'modified', 'deleted'] },
        status: { type: 'string', enum: ['pending', 'processed', 'failed'] },
        errorMessage: { type: 'string', nullable: true },
        library: { 
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            path: { type: 'string' },
          }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Dateiänderung nicht gefunden' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Abrufen der Dateiänderung mit ID: ${id}`, 'FileChangeController');
    return this.fileChangeService.findOne(id);
  }

  @Post('libraries/:id/detect')
  @ApiOperation({ summary: 'Dateiänderungen für eine Bibliothek erkennen' })
  @ApiParam({ name: 'id', description: 'Bibliotheks-ID', type: 'string', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'Erkannte Änderungen',
    schema: {
      type: 'object',
      properties: {
        added: { type: 'array', items: { type: 'string' } },
        modified: { type: 'array', items: { type: 'string' } },
        deleted: { type: 'array', items: { type: 'string' } },
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Bibliothek nicht gefunden' })
  detectChanges(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Erkennen von Dateiänderungen für Bibliothek ${id}`, 'FileChangeController');
    return this.fileChangeService.detectChangesForLibrary(id);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Dateiänderung verarbeiten' })
  @ApiParam({ name: 'id', description: 'Dateiänderungs-ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Dateiänderung wurde verarbeitet' })
  @ApiResponse({ status: 404, description: 'Dateiänderung nicht gefunden' })
  process(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Verarbeiten der Dateiänderung mit ID: ${id}`, 'FileChangeController');
    return this.fileChangeService.processChange(id);
  }
} 