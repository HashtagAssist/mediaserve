import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../shared/services/logger.service';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { LibraryStats, Library } from './entities/library.entity';
import { ApiOperation, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';

@Controller('libraries')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(
    private readonly libraryService: LibraryService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Neue Bibliothek erstellen' })
  @ApiBody({ 
    type: CreateLibraryDto, 
    examples: {
      'Neue Film-Bibliothek': {
        value: {
          name: 'Meine Filme',
          path: '/pfad/zu/filmen',
          autoScan: true,
          scanSchedule: '0 0 * * *' // Jeden Tag um Mitternacht
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Bibliothek wurde erstellt',
    type: Library
  })
  @ApiResponse({ status: 400, description: 'Ungültige Daten' })
  async create(@Body() createLibraryDto: CreateLibraryDto) {
    this.logger.debug(`Erstelle neue Bibliothek: ${createLibraryDto.name}`, 'LibraryController');
    return await this.libraryService.create(createLibraryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Alle Bibliotheken abrufen' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste aller Bibliotheken',
    type: [Library]
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  async findAll() {
    this.logger.debug('Rufe alle Bibliotheken ab', 'LibraryController');
    return await this.libraryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Eine Bibliothek abrufen' })
  @ApiParam({ name: 'id', description: 'ID der Bibliothek', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Die gefundene Bibliothek',
    type: Library
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Bibliothek nicht gefunden' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Rufe Bibliothek ab: ${id}`, 'LibraryController');
    return await this.libraryService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Bibliothek aktualisieren' })
  @ApiParam({ name: 'id', description: 'ID der Bibliothek', type: 'string' })
  @ApiBody({ type: UpdateLibraryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Aktualisierte Bibliothek',
    type: Library
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Bibliothek nicht gefunden' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLibraryDto: UpdateLibraryDto,
  ) {
    this.logger.debug(`Aktualisiere Bibliothek: ${id}`, 'LibraryController');
    return await this.libraryService.update(id, updateLibraryDto);
  }

  @Post(':id/scan')
  @ApiOperation({ 
    summary: 'Bibliothek scannen', 
    description: 'Startet einen Scan der Bibliothek nach neuen oder geänderten Medien'
  })
  @ApiParam({ name: 'id', description: 'ID der Bibliothek', type: 'string' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        recursive: { type: 'boolean', default: true, description: 'Unterverzeichnisse durchsuchen' },
        maxDepth: { type: 'number', description: 'Maximale Tiefe für rekursive Suche' },
        incrementalScan: { type: 'boolean', default: false, description: 'Nur neue/geänderte Dateien scannen' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Scan erfolgreich gestartet',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Scan erfolgreich gestartet' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Bibliothek nicht gefunden' })
  async scan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() scanOptions?: { 
      recursive?: boolean; 
      maxDepth?: number;
      incrementalScan?: boolean;
    },
  ) {
    this.logger.debug(
      `Starte Scan für Bibliothek: ${id} ${scanOptions?.recursive !== false ? '(rekursiv)' : ''} ${scanOptions?.incrementalScan ? '(inkrementell)' : ''}`,
      'LibraryController'
    );
    await this.libraryService.scanLibrary(id, scanOptions);
    return { message: 'Scan erfolgreich gestartet' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Bibliothek löschen' })
  @ApiParam({ name: 'id', description: 'ID der Bibliothek', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Bibliothek erfolgreich gelöscht',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Bibliothek erfolgreich gelöscht' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Bibliothek nicht gefunden' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Lösche Bibliothek: ${id}`, 'LibraryController');
    await this.libraryService.remove(id);
    return { message: 'Bibliothek erfolgreich gelöscht' };
  }

  @Get(':id/stats')
  @ApiOperation({ 
    summary: 'Bibliotheksstatistiken abrufen', 
    description: 'Ruft Statistiken über die Medien in der Bibliothek ab'
  })
  @ApiParam({ name: 'id', description: 'ID der Bibliothek', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Bibliotheksstatistiken',
    schema: {
      type: 'object',
      properties: {
        totalMedia: { type: 'number', example: 123 },
        mediaByType: { 
          type: 'object', 
          example: { movie: 50, music: 73 } 
        },
        totalSize: { type: 'number', example: 1073741824 },
        averageDuration: { type: 'number', example: 5400 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Bibliothek nicht gefunden' })
  async getStats(@Param('id', ParseUUIDPipe) id: string): Promise<LibraryStats> {
    this.logger.debug(`Rufe Statistiken für Bibliothek ab: ${id}`, 'LibraryController');
    return await this.libraryService.getStats(id);
  }
} 