import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Request,
  Header,
  Headers,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiOperation, ApiParam, ApiHeader } from '@nestjs/swagger';
import { Response } from 'express';
import { StreamingService } from './streaming.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../shared/services/logger.service';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@ApiTags('Streaming')
@Controller('streaming')
@UseGuards(JwtAuthGuard)
export class StreamingController {
  constructor(
    private readonly streamingService: StreamingService,
    private readonly logger: LoggerService,
  ) {}

  @Get(':id/stream')
  @ApiOperation({ 
    summary: 'Medium streamen', 
    description: 'Streamt ein Medium mit optionalem Range-Header für seitenweises Laden' 
  })
  @ApiParam({ name: 'id', description: 'ID des Mediums', type: 'string' })
  @ApiHeader({ 
    name: 'range', 
    required: false, 
    description: 'HTTP Range-Header für partielles Laden (z.B. "bytes=0-1023")' 
  })
  @ApiResponse({ status: 200, description: 'Vollständiges Medium' })
  @ApiResponse({ status: 206, description: 'Teilinhalt des Mediums (Partial Content)' })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Medium nicht gefunden' })
  async streamMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
    @Headers('range') range?: string,
  ): Promise<StreamableFile | void> {
    const userId = req.user.id;
    this.logger.debug(
      `Streaming-Anfrage für Medium ${id} von Benutzer ${userId}`,
      'StreamingController'
    );
    
    return await this.streamingService.streamMedia(id, userId, res, range);
  }

  @Get(':id/info')
  @ApiOperation({ 
    summary: 'Medieninformationen abrufen', 
    description: 'Ruft technische Informationen zum Medium ab' 
  })
  @ApiParam({ name: 'id', description: 'ID des Mediums', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Medieninformationen',
    schema: {
      type: 'object',
      properties: {
        format: { type: 'string', example: 'matroska,webm' },
        duration: { type: 'number', example: 7260.123 },
        size: { type: 'number', example: 1073741824 },
        bitrate: { type: 'number', example: 2500000 },
        videoCodec: { type: 'string', example: 'h264' },
        audioCodec: { type: 'string', example: 'aac' },
        resolution: { type: 'string', example: '1920x1080' },
        fps: { type: 'number', example: 24 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Medium nicht gefunden' })
  async getMediaInfo(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userId = req.user.id;
    this.logger.debug(
      `Medieninfo-Anfrage für Medium ${id} von Benutzer ${userId}`,
      'StreamingController'
    );
    
    return await this.streamingService.getMediaInfo(id, userId);
  }

  @Get(':id/subtitles')
  @ApiOperation({ 
    summary: 'Untertitel-Informationen abrufen', 
    description: 'Ruft verfügbare Untertiteldateien für ein Medium ab' 
  })
  @ApiParam({ name: 'id', description: 'ID des Mediums', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Verfügbare Untertitel',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          fileName: { type: 'string', example: 'subtitles.de.srt' },
          language: { type: 'string', example: 'de' },
          label: { type: 'string', example: 'Deutsch' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Medium nicht gefunden' })
  async getSubtitles(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userId = req.user.id;
    this.logger.debug(
      `Untertitel-Anfrage für Medium ${id} von Benutzer ${userId}`,
      'StreamingController'
    );
    
    return await this.streamingService.getSubtitles(id, userId);
  }

  @Get(':id/subtitles/:fileName')
  @ApiOperation({ 
    summary: 'Untertiteldatei abrufen', 
    description: 'Ruft eine bestimmte Untertiteldatei für ein Medium ab' 
  })
  @ApiParam({ name: 'id', description: 'ID des Mediums', type: 'string' })
  @ApiParam({ name: 'fileName', description: 'Name der Untertiteldatei', type: 'string' })
  @ApiResponse({ status: 200, description: 'Untertiteldatei' })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Medium oder Untertiteldatei nicht gefunden' })
  async getSubtitleFile(
    @Request() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fileName') fileName: string,
  ): Promise<StreamableFile> {
    const userId = req.user.id;
    this.logger.debug(
      `Untertiteldatei-Anfrage für Medium ${id}, Datei ${fileName} von Benutzer ${userId}`,
      'StreamingController'
    );
    
    return await this.streamingService.getSubtitleFile(id, fileName, userId, res);
  }
} 