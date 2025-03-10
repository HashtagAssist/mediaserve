import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileChangeService } from './file-change.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../shared/services/logger.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Dateiänderungen')
@Controller('file-changes')
@UseGuards(JwtAuthGuard)
export class FileChangeController {
  constructor(
    private readonly fileChangeService: FileChangeService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Dateiänderungen abrufen', 
    description: 'Ruft eine Liste von Dateiänderungen mit Paginierung ab' 
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Anzahl der Ergebnisse pro Seite', type: Number })
  @ApiQuery({ name: 'offset', required: false, description: 'Seitenversatz für Paginierung', type: Number })
  @ApiQuery({ name: 'type', required: false, description: 'Typ der Änderung (added, modified, deleted)' })
  @ApiQuery({ name: 'status', required: false, description: 'Status der Änderung (pending, processed, failed)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste der Dateiänderungen',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 42 },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
              path: { type: 'string', example: '/pfad/zur/datei.mp4' },
              type: { type: 'string', example: 'added' },
              status: { type: 'string', example: 'pending' },
              libraryId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
              createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  async findAll(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    this.logger.debug(
      `Rufe Dateiänderungen ab: limit=${limit}, offset=${offset}, type=${type}, status=${status}`,
      'FileChangeController'
    );
    return this.fileChangeService.findAll(limit, offset, type, status);
  }

  @Post('process')
  @ApiOperation({ 
    summary: 'Dateiänderungen verarbeiten', 
    description: 'Verarbeitet ausstehende Dateiänderungen' 
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        libraryId: { 
          type: 'string', 
          example: '550e8400-e29b-41d4-a716-446655440000',
          description: 'Optional: Nur Änderungen für eine bestimmte Bibliothek verarbeiten'
        }
      },
      required: []
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Dateiänderungen erfolgreich verarbeitet',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Dateiänderungen erfolgreich verarbeitet' },
        processed: { type: 'number', example: 5 },
        failed: { type: 'number', example: 0 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  async processChanges(@Body() body: { libraryId?: string }) {
    this.logger.debug(
      `Verarbeite Dateiänderungen${body.libraryId ? ` für Bibliothek ${body.libraryId}` : ''}`,
      'FileChangeController'
    );
    const result = await this.fileChangeService.processChanges(body.libraryId);
    return {
      message: 'Dateiänderungen erfolgreich verarbeitet',
      ...result
    };
  }
} 