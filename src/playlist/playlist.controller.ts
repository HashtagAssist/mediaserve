import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../shared/services/logger.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Playlisten')
@Controller('playlists')
@UseGuards(JwtAuthGuard)
export class PlaylistController {
  constructor(
    private readonly playlistService: PlaylistService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Neue Playlist erstellen' })
  @ApiBody({ 
    type: CreatePlaylistDto,
    examples: {
      'Neue Playlist': {
        value: {
          name: 'Meine Lieblingsfilme',
          description: 'Eine Sammlung meiner Lieblingsfilme'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Playlist erfolgreich erstellt',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        name: { type: 'string', example: 'Meine Lieblingsfilme' },
        description: { type: 'string', example: 'Eine Sammlung meiner Lieblingsfilme' },
        userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
        createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Ungültige Daten' })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  async create(
    @Request() req,
    @Body() createPlaylistDto: CreatePlaylistDto,
  ) {
    const userId = req.user.id;
    this.logger.debug(
      `Anfrage zum Erstellen einer neuen Playlist von Benutzer ${userId}`,
      'PlaylistController'
    );
    
    return await this.playlistService.create(userId, createPlaylistDto);
  }

  @Get()
  @ApiOperation({ summary: 'Alle Playlisten des Benutzers abrufen' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste der Playlisten',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
          name: { type: 'string', example: 'Meine Lieblingsfilme' },
          description: { type: 'string', example: 'Eine Sammlung meiner Lieblingsfilme' },
          mediaCount: { type: 'number', example: 5 },
          userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
          createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  async findAll(@Request() req) {
    const userId = req.user.id;
    this.logger.debug(
      `Anfrage zum Abrufen aller Playlists für Benutzer ${userId}`,
      'PlaylistController'
    );
    
    return await this.playlistService.findAll(userId);
  }

  @Get('my')
  async getUserPlaylists(@Request() req) {
    const userId = req.user.id;
    this.logger.debug(
      `Anfrage zum Abrufen der Playlists von Benutzer ${userId}`,
      'PlaylistController'
    );
    
    return await this.playlistService.getUserPlaylists(userId);
  }

  @Get('public')
  async getPublicPlaylists(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    this.logger.debug(
      `Anfrage zum Abrufen öffentlicher Playlists`,
      'PlaylistController'
    );
    
    return await this.playlistService.getPublicPlaylists(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Eine bestimmte Playlist abrufen' })
  @ApiParam({ name: 'id', description: 'ID der Playlist', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Die abgerufene Playlist mit Medien',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        name: { type: 'string', example: 'Meine Lieblingsfilme' },
        description: { type: 'string', example: 'Eine Sammlung meiner Lieblingsfilme' },
        userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
        media: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
              title: { type: 'string', example: 'Beispielvideo' },
              thumbnailPath: { type: 'string', example: '/pfad/zum/thumbnail.jpg' },
              type: { type: 'string', example: 'movie' },
              duration: { type: 'number', example: 7200 }
            }
          }
        },
        createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Playlist nicht gefunden' })
  async findOne(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userId = req.user.id;
    this.logger.debug(
      `Anfrage zum Abrufen der Playlist ${id} von Benutzer ${userId}`,
      'PlaylistController'
    );
    
    return await this.playlistService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Playlist aktualisieren' })
  @ApiParam({ name: 'id', description: 'ID der Playlist', type: 'string' })
  @ApiBody({ 
    type: UpdatePlaylistDto,
    examples: {
      'Playlist aktualisieren': {
        value: {
          name: 'Aktualisierter Name',
          description: 'Aktualisierte Beschreibung'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Playlist erfolgreich aktualisiert',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        name: { type: 'string', example: 'Aktualisierter Name' },
        description: { type: 'string', example: 'Aktualisierte Beschreibung' },
        userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
        updatedAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Ungültige Daten' })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Playlist nicht gefunden' })
  async update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
  ) {
    const userId = req.user.id;
    this.logger.debug(
      `Anfrage zum Aktualisieren der Playlist ${id} von Benutzer ${userId}`,
      'PlaylistController'
    );
    
    return await this.playlistService.update(id, userId, updatePlaylistDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Playlist löschen' })
  @ApiParam({ name: 'id', description: 'ID der Playlist', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Playlist erfolgreich gelöscht',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Playlist erfolgreich gelöscht' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Playlist nicht gefunden' })
  async remove(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userId = req.user.id;
    this.logger.debug(
      `Anfrage zum Löschen der Playlist ${id} von Benutzer ${userId}`,
      'PlaylistController'
    );
    
    await this.playlistService.remove(id, userId);
    return { message: 'Playlist erfolgreich gelöscht' };
  }

  @Post(':id/items/:mediaId')
  @ApiOperation({ summary: 'Medium zur Playlist hinzufügen' })
  @ApiParam({ name: 'id', description: 'ID der Playlist', type: 'string' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Medium erfolgreich zur Playlist hinzugefügt',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Medium erfolgreich zur Playlist hinzugefügt' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Playlist oder Medium nicht gefunden' })
  async addItem(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ) {
    const userId = req.user.id;
    this.logger.debug(
      `Anfrage zum Hinzufügen von Medium ${mediaId} zur Playlist ${id} von Benutzer ${userId}`,
      'PlaylistController'
    );
    
    return await this.playlistService.addItem(id, mediaId, userId);
  }

  @Delete(':id/items/:mediaId')
  @ApiOperation({ summary: 'Medium aus Playlist entfernen' })
  @ApiParam({ name: 'id', description: 'ID der Playlist', type: 'string' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Medium erfolgreich aus Playlist entfernt',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Medium erfolgreich aus Playlist entfernt' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Playlist oder Medium nicht gefunden' })
  async removeItem(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ) {
    const userId = req.user.id;
    this.logger.debug(
      `Anfrage zum Entfernen von Medium ${mediaId} aus Playlist ${id} von Benutzer ${userId}`,
      'PlaylistController'
    );
    
    return await this.playlistService.removeItem(id, mediaId, userId);
  }
} 