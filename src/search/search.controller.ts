import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { SearchService, SearchOptions } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../shared/services/logger.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MediaType } from '../media/enums/media-type.enum';

@ApiTags('Suche')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Mediensuche', 
    description: 'Durchsucht Medien nach verschiedenen Kriterien mit Paginierung und Filtern.' 
  })
  @ApiQuery({ name: 'query', required: false, description: 'Suchbegriff' })
  @ApiQuery({ name: 'type', enum: MediaType, required: false, description: 'Medientyp-Filter' })
  @ApiQuery({ name: 'limit', required: false, description: 'Anzahl der Ergebnisse pro Seite', type: Number })
  @ApiQuery({ name: 'offset', required: false, description: 'Seitenversatz für Paginierung', type: Number })
  @ApiQuery({ name: 'genres', required: false, description: 'Nach Genres filtern (kommagetrennt)', type: String })
  @ApiQuery({ name: 'yearMin', required: false, description: 'Mindestjahr', type: Number })
  @ApiQuery({ name: 'yearMax', required: false, description: 'Maximaljahr', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Suchergebnisse',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: { 
            type: 'object',
            properties: {
              id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
              title: { type: 'string', example: 'Beispielvideo' },
              type: { type: 'string', example: 'movie' },
              description: { type: 'string', example: 'Eine Beschreibung des Videos' },
              thumbnailPath: { type: 'string', example: '/pfad/zu/thumbnail.jpg' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 42 },
            limit: { type: 'number', example: 20 },
            offset: { type: 'number', example: 0 },
            pages: { type: 'number', example: 3 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  async search(
    @Query('query') query?: string,
    @Query('type') type?: string,
    @Query('genres') genres?: string,
    @Query('yearMin', new DefaultValuePipe(0), ParseIntPipe) yearMin?: number,
    @Query('yearMax', new DefaultValuePipe(0), ParseIntPipe) yearMax?: number,
    @Query('durationMin', new DefaultValuePipe(0), ParseIntPipe) durationMin?: number,
    @Query('durationMax', new DefaultValuePipe(0), ParseIntPipe) durationMax?: number,
    @Query('libraryId') libraryId?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
    @Query('sortBy', new DefaultValuePipe('title')) sortBy?: string,
    @Query('sortOrder', new DefaultValuePipe('ASC')) sortOrder?: 'ASC' | 'DESC',
  ) {
    this.logger.debug(`Suche mit Query: ${query || 'keine'}`, 'SearchController');
    
    const options: SearchOptions = {
      query,
      limit,
      offset,
      sortBy,
      sortOrder: sortOrder === 'DESC' ? 'DESC' : 'ASC',
    };
    
    // Verarbeite Medientyp
    if (type) {
      type MediaTypeFilter = 'movie' | 'music' | string[];
      options.type = type.includes(',') ? type.split(',') : type as MediaTypeFilter;
    }
    
    // Verarbeite Genres
    if (genres) {
      options.genres = genres.split(',');
    }
    
    // Verarbeite Jahr
    if (yearMin > 0 || yearMax > 0) {
      options.year = {};
      if (yearMin > 0) options.year.min = yearMin;
      if (yearMax > 0) options.year.max = yearMax;
    }
    
    // Verarbeite Dauer
    if (durationMin > 0 || durationMax > 0) {
      options.duration = {};
      if (durationMin > 0) options.duration.min = durationMin;
      if (durationMax > 0) options.duration.max = durationMax;
    }
    
    // Verarbeite Bibliothek
    if (libraryId) {
      options.libraryId = libraryId;
    }
    
    return await this.searchService.search(options);
  }

  @Get('suggest')
  async suggest(
    @Query('query') query: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    this.logger.debug(`Vorschlagsanfrage erhalten: ${query}`, 'SearchController');
    return await this.searchService.suggest(query, limit);
  }
} 