import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  ParseUUIDPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Progress } from './entities/progress.entity';
import { LoggerService } from '../shared/services/logger.service';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: string;
    // andere Benutzerfelder...
  };
}

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  private readonly logger = new Logger(ProgressController.name);

  constructor(
    private readonly progressService: ProgressService,
    private readonly loggerService: LoggerService,
  ) {}

  @ApiOperation({ summary: 'Speichert den Wiedergabefortschritt eines Mediums' })
  @ApiBody({ type: CreateProgressDto })
  @ApiResponse({ status: 201, description: 'Fortschritt erfolgreich gespeichert' })
  @ApiResponse({ status: 404, description: 'Medium oder Benutzer nicht gefunden' })
  @Post()
  async create(@Request() req: RequestWithUser, @Body() createProgressDto: CreateProgressDto) {
    this.logger.debug(
      `Speichere Fortschritt für Medium ${createProgressDto.mediaId}`,
      'ProgressController'
    );
    
    try {
      const userId = req.user.id;
      const progress = await this.progressService.create(userId, createProgressDto);
      
      return {
        message: 'Fortschritt erfolgreich gespeichert',
        progress,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(
        `Fehler beim Speichern des Fortschritts: ${error.message}`,
        error.stack,
        'ProgressController'
      );
      
      throw new InternalServerErrorException('Fehler beim Speichern des Fortschritts');
    }
  }

  @ApiOperation({ summary: 'Ruft alle Fortschritte des Benutzers ab' })
  @ApiResponse({ status: 200, description: 'Liste aller Fortschritte' })
  @Get()
  async findAll(@Request() req: RequestWithUser) {
    this.logger.debug('Rufe alle Fortschritte ab', 'ProgressController');
    
    try {
      const userId = req.user.id;
      const progress = await this.progressService.findAllByUser(userId);
      
      return progress;
    } catch (error) {
      this.logger.error(
        `Fehler beim Abrufen der Fortschritte: ${error.message}`,
        error.stack,
        'ProgressController'
      );
      
      throw new InternalServerErrorException('Fehler beim Abrufen der Fortschritte');
    }
  }

  @ApiOperation({ summary: 'Ruft die "Weiterschauen"-Liste des Benutzers ab' })
  @ApiResponse({ status: 200, description: 'Liste der unvollständig angesehenen Medien' })
  @Get('continue-watching')
  async findContinueWatching(
    @Request() req: RequestWithUser,
    @Query('limit') limit?: number,
  ) {
    this.logger.debug('Rufe "Weiterschauen"-Liste ab', 'ProgressController');
    
    try {
      const userId = req.user.id;
      const progress = await this.progressService.findContinueWatching(userId, limit);
      
      return progress;
    } catch (error) {
      this.logger.error(
        `Fehler beim Abrufen der "Weiterschauen"-Liste: ${error.message}`,
        error.stack,
        'ProgressController'
      );
      
      throw new InternalServerErrorException('Fehler beim Abrufen der "Weiterschauen"-Liste');
    }
  }

  @ApiOperation({ summary: 'Ruft den Fortschritt für ein bestimmtes Medium ab' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums' })
  @ApiResponse({ status: 200, description: 'Fortschritt gefunden' })
  @ApiResponse({ status: 404, description: 'Kein Fortschritt gefunden' })
  @Get(':mediaId')
  async findOne(
    @Request() req: RequestWithUser,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ): Promise<Progress | { message: string }> {
    this.logger.debug(`Rufe Fortschritt für Medium ${mediaId} ab`, 'ProgressController');
    
    try {
      const userId = req.user.id;
      const progress = await this.progressService.findOne(userId, mediaId);
      
      if (!progress) {
        return { message: 'Kein Fortschritt gefunden' };
      }
      
      return progress;
    } catch (error) {
      this.logger.error(
        `Fehler beim Abrufen des Fortschritts: ${error.message}`,
        error.stack,
        'ProgressController'
      );
      
      throw new InternalServerErrorException('Fehler beim Abrufen des Fortschritts');
    }
  }

  @ApiOperation({ summary: 'Löscht den Fortschritt für ein bestimmtes Medium' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums' })
  @ApiResponse({ status: 200, description: 'Fortschritt erfolgreich gelöscht' })
  @ApiResponse({ status: 404, description: 'Fortschritt nicht gefunden' })
  @Delete(':mediaId')
  async remove(
    @Request() req: RequestWithUser,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ): Promise<{ message: string }> {
    this.logger.debug(`Lösche Fortschritt für Medium ${mediaId}`, 'ProgressController');
    
    try {
      const userId = req.user.id;
      await this.progressService.remove(userId, mediaId);
      
      return { message: 'Fortschritt erfolgreich gelöscht' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(
        `Fehler beim Löschen des Fortschritts: ${error.message}`,
        error.stack,
        'ProgressController'
      );
      
      throw new InternalServerErrorException('Fehler beim Löschen des Fortschritts');
    }
  }

  @ApiOperation({ summary: 'Aktualisiert den Fortschritt für ein bestimmtes Medium' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums' })
  @ApiBody({ type: UpdateProgressDto })
  @ApiResponse({ status: 200, description: 'Fortschritt erfolgreich aktualisiert' })
  @ApiResponse({ status: 404, description: 'Fortschritt nicht gefunden' })
  @Patch(':mediaId')
  async update(
    @Request() req: RequestWithUser,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    this.logger.debug(
      `Aktualisiere Fortschritt für Medium ${mediaId}`,
      'ProgressController'
    );
    
    try {
      const userId = req.user.id;
      const progress = await this.progressService.update(userId, mediaId, updateProgressDto);
      
      return {
        message: 'Fortschritt erfolgreich aktualisiert',
        progress,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(
        `Fehler beim Aktualisieren des Fortschritts: ${error.message}`,
        error.stack,
        'ProgressController'
      );
      
      throw new InternalServerErrorException('Fehler beim Aktualisieren des Fortschritts');
    }
  }

  @Get('media/:mediaId')
  @ApiOperation({ summary: 'Wiedergabefortschritt eines Mediums abrufen' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wiedergabefortschritt',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
        mediaId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
        position: { type: 'number', example: 1800 },
        duration: { type: 'number', example: 7200 },
        completed: { type: 'boolean', example: false },
        lastPlayed: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Medium nicht gefunden' })
  async getProgress(@Param('mediaId', ParseUUIDPipe) mediaId: string, @Request() req) {
    this.logger.debug(`Rufe Fortschritt für Medium ${mediaId} ab`, 'ProgressController');
    const userId = req.user.id;
    return this.progressService.getProgress(userId, mediaId);
  }

  @Post('media/:mediaId')
  @ApiOperation({ summary: 'Wiedergabefortschritt aktualisieren' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums', type: 'string' })
  @ApiBody({
    type: UpdateProgressDto,
    examples: {
      'Fortschritt aktualisieren': {
        value: {
          position: 1800,
          duration: 7200,
          completed: false
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Fortschritt erfolgreich aktualisiert',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
        mediaId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
        position: { type: 'number', example: 1800 },
        duration: { type: 'number', example: 7200 },
        completed: { type: 'boolean', example: false },
        lastPlayed: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Ungültige Daten' })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Medium nicht gefunden' })
  async updateProgress(
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @Request() req
  ) {
    this.logger.debug(
      `Aktualisiere Fortschritt für Medium ${mediaId} zu Position ${updateProgressDto.position}`,
      'ProgressController'
    );
    const userId = req.user.id;
    return this.progressService.updateMediaProgress(userId, mediaId, updateProgressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Alle Fortschritte des Benutzers abrufen' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste aller Medienwiedergabefortschritte',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
          mediaId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
          media: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
              title: { type: 'string', example: 'Beispielvideo' },
              thumbnailPath: { type: 'string', example: '/pfad/zum/thumbnail.jpg' },
              type: { type: 'string', example: 'movie' }
            }
          },
          position: { type: 'number', example: 1800 },
          duration: { type: 'number', example: 7200 },
          progress: { type: 'number', example: 25 },
          completed: { type: 'boolean', example: false },
          lastPlayed: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  async getAllProgress(@Request() req) {
    this.logger.debug('Rufe alle Fortschritte für Benutzer ab', 'ProgressController');
    const userId = req.user.id;
    return this.progressService.getUserProgress(userId);
  }

  @Get('continue-watching')
  @ApiOperation({ 
    summary: 'Weiterschauen-Liste abrufen', 
    description: 'Ruft eine Liste von Medien ab, die der Benutzer begonnen hat zu schauen, aber noch nicht beendet hat'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Weiterschauen-Liste',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
          mediaId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
          media: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
              title: { type: 'string', example: 'Beispielvideo' },
              thumbnailPath: { type: 'string', example: '/pfad/zum/thumbnail.jpg' },
              type: { type: 'string', example: 'movie' }
            }
          },
          position: { type: 'number', example: 1800 },
          duration: { type: 'number', example: 7200 },
          progress: { type: 'number', example: 25 },
          lastPlayed: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  async getContinueWatching(@Request() req) {
    this.logger.debug('Rufe Weiterschauen-Liste für Benutzer ab', 'ProgressController');
    const userId = req.user.id;
    return this.progressService.findContinueWatching(userId);
  }
} 