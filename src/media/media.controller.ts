import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaType } from './enums/media-type.enum';
import { LoggerService } from '../shared/services/logger.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Media } from './entities/media.entity';

@ApiTags('Medien')
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  async create(@Body() createMediaDto: CreateMediaDto) {
    this.logger.debug(`Erstelle neues Medium: ${createMediaDto.title}`, 'MediaController');
    try {
      const media = await this.mediaService.create(createMediaDto);
      this.logger.debug(`Medium erfolgreich erstellt: ${media.id}`, 'MediaController');
      return media;
    } catch (error) {
      this.logger.error(
        `Fehler beim Erstellen des Mediums: ${error.message}`,
        error.stack,
        'MediaController'
      );
      throw new InternalServerErrorException('Fehler beim Erstellen des Mediums');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Alle Medien abrufen', description: 'Ruft eine Liste aller Medien ab, optional nach Typ gefiltert.' })
  @ApiQuery({ name: 'type', enum: MediaType, required: false, description: 'Filter nach Medientyp' })
  @ApiResponse({
    status: 200,
    description: 'Liste von Medien',
    type: [Media],
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Beispielvideo',
          path: '/pfad/zum/video.mp4',
          type: 'movie',
          duration: 7200,
          processed: true,
          createdAt: '2025-03-10T12:00:00Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 500, description: 'Serverfehler' })
  async findAll(@Query('type') type?: MediaType) {
    this.logger.debug(`Suche alle Medien${type ? ` vom Typ ${type}` : ''}`, 'MediaController');
    try {
      const media = await this.mediaService.findAll(type);
      this.logger.debug(`${media.length} Medien gefunden`, 'MediaController');
      return media;
    } catch (error) {
      this.logger.error(
        `Fehler beim Abrufen der Medien: ${error.message}`,
        error.stack,
        'MediaController'
      );
      throw new InternalServerErrorException('Fehler beim Abrufen der Medien');
    }
  }

  @Get('search')
  async search(@Query('q') query: string) {
    this.logger.debug(`Suche Medien mit Query: ${query}`, 'MediaController');
    try {
      const media = await this.mediaService.search(query);
      this.logger.debug(`${media.length} Medien für Suche gefunden`, 'MediaController');
      return media;
    } catch (error) {
      this.logger.error(
        `Fehler bei der Mediensuche: ${error.message}`,
        error.stack,
        'MediaController'
      );
      throw new InternalServerErrorException('Fehler bei der Mediensuche');
    }
  }

  @Get('genre/:genre')
  async findByGenre(@Param('genre') genre: string) {
    this.logger.debug(`Suche Medien nach Genre: ${genre}`, 'MediaController');
    try {
      const media = await this.mediaService.findByGenre(genre);
      this.logger.debug(`${media.length} Medien im Genre gefunden`, 'MediaController');
      return media;
    } catch (error) {
      this.logger.error(
        `Fehler bei der Genre-Suche: ${error.message}`,
        error.stack,
        'MediaController'
      );
      throw new InternalServerErrorException('Fehler bei der Genre-Suche');
    }
  }

  @Get('year/:year')
  async findByYear(@Param('year') year: number) {
    this.logger.debug(`Suche Medien nach Jahr: ${year}`, 'MediaController');
    try {
      const media = await this.mediaService.findByYear(year);
      this.logger.debug(`${media.length} Medien im Jahr gefunden`, 'MediaController');
      return media;
    } catch (error) {
      this.logger.error(
        `Fehler bei der Jahressuche: ${error.message}`,
        error.stack,
        'MediaController'
      );
      throw new InternalServerErrorException('Fehler bei der Jahressuche');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Suche Medium mit ID: ${id}`, 'MediaController');
    try {
      const media = await this.mediaService.findOne(id);
      this.logger.debug(`Medium ${id} gefunden`, 'MediaController');
      return media;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`Medium ${id} nicht gefunden`, 'MediaController');
        throw error;
      }
      this.logger.error(
        `Fehler beim Abrufen des Mediums ${id}: ${error.message}`,
        error.stack,
        'MediaController'
      );
      throw new InternalServerErrorException('Fehler beim Abrufen des Mediums');
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMediaDto: UpdateMediaDto,
  ) {
    this.logger.debug(`Aktualisiere Medium ${id}`, 'MediaController');
    try {
      const media = await this.mediaService.update(id, updateMediaDto);
      this.logger.debug(`Medium ${id} aktualisiert`, 'MediaController');
      return media;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`Medium ${id} nicht gefunden`, 'MediaController');
        throw error;
      }
      this.logger.error(
        `Fehler beim Aktualisieren des Mediums ${id}: ${error.message}`,
        error.stack,
        'MediaController'
      );
      throw new InternalServerErrorException('Fehler beim Aktualisieren des Mediums');
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Lösche Medium ${id}`, 'MediaController');
    try {
      await this.mediaService.remove(id);
      this.logger.debug(`Medium ${id} gelöscht`, 'MediaController');
      return { message: 'Medium erfolgreich gelöscht' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`Medium ${id} nicht gefunden`, 'MediaController');
        throw error;
      }
      this.logger.error(
        `Fehler beim Löschen des Mediums ${id}: ${error.message}`,
        error.stack,
        'MediaController'
      );
      throw new InternalServerErrorException('Fehler beim Löschen des Mediums');
    }
  }

  @Put(':id/process')
  async markAsProcessed(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Markiere Medium ${id} als verarbeitet`, 'MediaController');
    try {
      const media = await this.mediaService.markAsProcessed(id);
      this.logger.debug(`Medium ${id} erfolgreich als verarbeitet markiert`, 'MediaController');
      return media;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`Medium ${id} nicht gefunden`, 'MediaController');
        throw error;
      }
      this.logger.error(
        `Fehler beim Markieren des Mediums ${id} als verarbeitet: ${error.message}`,
        error.stack,
        'MediaController'
      );
      throw new InternalServerErrorException('Fehler beim Markieren des Mediums als verarbeitet');
    }
  }

  @Post('import-directory')
  async importDirectory(@Body('path') directoryPath: string) {
    this.logger.debug(`Importiere Medien aus Verzeichnis: ${directoryPath}`, 'MediaController');
    try {
      const media = await this.mediaService.importDirectory(directoryPath);
      this.logger.debug(`${media.length} Medien importiert`, 'MediaController');
      return media;
    } catch (error) {
      this.logger.error(
        `Fehler beim Importieren aus Verzeichnis ${directoryPath}: ${error.message}`,
        error.stack,
        'MediaController'
      );
      throw new InternalServerErrorException('Fehler beim Importieren der Medien');
    }
  }
} 