import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body, 
  UseGuards,
  ParseUUIDPipe,
  NotFoundException,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../shared/services/logger.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Metadaten')
@Controller('metadata')
@UseGuards(JwtAuthGuard)
export class MetadataController {
  constructor(
    private readonly metadataService: MetadataService,
    private readonly logger: LoggerService,
  ) {}

  @Get('media/:mediaId')
  @ApiOperation({ summary: 'Metadaten eines Mediums abrufen' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Metadaten des Mediums',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Beispielfilm' },
        description: { type: 'string', example: 'Ein Beispielfilm über...' },
        releaseYear: { type: 'number', example: 2023 },
        director: { type: 'string', example: 'Max Mustermann' },
        actors: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['Schauspieler 1', 'Schauspieler 2'] 
        },
        genres: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['Action', 'Drama'] 
        },
        duration: { type: 'number', example: 7200 },
        language: { type: 'string', example: 'de' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Medium nicht gefunden' })
  async getMediaMetadata(@Param('mediaId', ParseUUIDPipe) mediaId: string) {
    this.logger.debug(`Rufe Metadaten für Medium ${mediaId} ab`, 'MetadataController');
    return this.metadataService.getMediaMetadata(mediaId);
  }

  @Post('media/:mediaId/fetch')
  @ApiOperation({ 
    summary: 'Metadaten für ein Medium abrufen', 
    description: 'Ruft Metadaten von externen Quellen ab und speichert sie' 
  })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums', type: 'string' })
  @ApiQuery({ name: 'source', required: false, description: 'Metadatenquelle (z.B. "tmdb", "omdb")' })
  @ApiResponse({ 
    status: 200, 
    description: 'Metadaten erfolgreich abgerufen',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Metadaten erfolgreich abgerufen' },
        metadata: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Beispielfilm' },
            description: { type: 'string', example: 'Ein Beispielfilm über...' },
            releaseYear: { type: 'number', example: 2023 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Medium nicht gefunden' })
  async fetchMetadata(
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Query('source') source?: string,
  ) {
    this.logger.debug(
      `Rufe Metadaten für Medium ${mediaId} von Quelle ${source || 'Standard'} ab`,
      'MetadataController'
    );
    return this.metadataService.fetchMetadata(mediaId, source);
  }

  @Post('media/:mediaId')
  @ApiOperation({ summary: 'Metadaten für ein Medium aktualisieren' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Neuer Titel' },
        description: { type: 'string', example: 'Neue Beschreibung' },
        releaseYear: { type: 'number', example: 2023 },
        genres: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['Action', 'Drama'] 
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Metadaten erfolgreich aktualisiert',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Metadaten erfolgreich aktualisiert' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Medium nicht gefunden' })
  async updateMetadata(
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Body() metadataDto: any,
  ) {
    this.logger.debug(`Aktualisiere Metadaten für Medium ${mediaId}`, 'MetadataController');
    await this.metadataService.updateMetadata(mediaId, metadataDto);
    return { message: 'Metadaten erfolgreich aktualisiert' };
  }

  @Post('extract/:id')
  async extractMetadata(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Starte Metadatenextraktion für Medium: ${id}`, 'MetadataController');
    try {
      const media = await this.metadataService.extractMetadata(id);
      this.logger.debug(`Metadatenextraktion für Medium ${id} erfolgreich`, 'MetadataController');
      return media;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`Medium ${id} für Metadatenextraktion nicht gefunden`, 'MetadataController');
        throw error;
      }
      this.logger.error(
        `Fehler bei der Metadatenextraktion für Medium ${id}: ${error.message}`,
        error.stack,
        'MetadataController'
      );
      throw new InternalServerErrorException('Fehler bei der Metadatenextraktion');
    }
  }

  @Post('analyze-directory')
  async analyzeDirectory(@Body('path') directoryPath: string) {
    this.logger.debug(`Starte Verzeichnisanalyse: ${directoryPath}`, 'MetadataController');
    try {
      const mediaFiles = await this.metadataService.analyzeDirectory(directoryPath);
      this.logger.debug(
        `Verzeichnisanalyse abgeschlossen, ${mediaFiles.length} Dateien gefunden`,
        'MetadataController'
      );
      return mediaFiles;
    } catch (error) {
      this.logger.error(
        `Fehler bei der Verzeichnisanalyse von ${directoryPath}: ${error.message}`,
        error.stack,
        'MetadataController'
      );
      throw new InternalServerErrorException('Fehler bei der Verzeichnisanalyse');
    }
  }
} 