import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
  ParseUUIDPipe,
  NotFoundException,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ThumbnailService } from './thumbnail.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../shared/services/logger.service';
import * as fs from 'fs';
import * as path from 'path';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Thumbnails')
@Controller('thumbnails')
@UseGuards(JwtAuthGuard)
export class ThumbnailController {
  constructor(
    private readonly thumbnailService: ThumbnailService,
    private readonly logger: LoggerService,
  ) {}

  @Get('media/:mediaId')
  @ApiOperation({ summary: 'Thumbnail eines Mediums abrufen' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums', type: 'string' })
  @ApiResponse({ status: 200, description: 'Thumbnail-Bild' })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Thumbnail nicht gefunden' })
  async getThumbnail(
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    this.logger.debug(`Rufe Thumbnail für Medium ${mediaId} ab`, 'ThumbnailController');
    return this.thumbnailService.getThumbnail(mediaId, res);
  }

  @Post('media/:mediaId/generate')
  @ApiOperation({ 
    summary: 'Thumbnail für ein Medium generieren', 
    description: 'Generiert ein Thumbnail aus dem Medieninhalt' 
  })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thumbnail erfolgreich generiert',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Thumbnail erfolgreich generiert' },
        thumbnailPath: { type: 'string', example: '/pfad/zum/thumbnail.jpg' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Medium nicht gefunden' })
  async generateThumbnail(@Param('mediaId', ParseUUIDPipe) mediaId: string) {
    this.logger.debug(`Generiere Thumbnail für Medium ${mediaId}`, 'ThumbnailController');
    const thumbnailPath = await this.thumbnailService.generateThumbnail(mediaId);
    return { 
      message: 'Thumbnail erfolgreich generiert',
      thumbnailPath 
    };
  }

  @Post('media/:mediaId/upload')
  @ApiOperation({ summary: 'Benutzerdefiniertes Thumbnail hochladen' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums', type: 'string' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Thumbnail-Bilddatei'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thumbnail erfolgreich hochgeladen',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Thumbnail erfolgreich hochgeladen' },
        thumbnailPath: { type: 'string', example: '/pfad/zum/thumbnail.jpg' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Medium nicht gefunden' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadThumbnail(
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @UploadedFile() file: any,
  ) {
    this.logger.debug(`Lade Thumbnail für Medium ${mediaId} hoch`, 'ThumbnailController');
    const thumbnailPath = await this.thumbnailService.saveThumbnail(mediaId, file);
    return { 
      message: 'Thumbnail erfolgreich hochgeladen',
      thumbnailPath 
    };
  }

  @Post('library/:libraryId')
  async generateThumbnailsForLibrary(@Param('libraryId', ParseUUIDPipe) libraryId: string) {
    this.logger.debug(`Anfrage zur Thumbnail-Generierung für Bibliothek ${libraryId}`, 'ThumbnailController');
    const count = await this.thumbnailService.generateThumbnailsForLibrary(libraryId);
    
    return { 
      message: `Thumbnail-Generierung abgeschlossen`,
      generated: count,
    };
  }
} 