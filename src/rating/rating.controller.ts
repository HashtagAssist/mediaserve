import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../shared/services/logger.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Bewertungen')
@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingController {
  constructor(
    private readonly ratingService: RatingService,
    private readonly logger: LoggerService,
  ) {}

  @Post('media/:mediaId')
  @ApiOperation({ summary: 'Medium bewerten' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums', type: 'string' })
  @ApiBody({
    type: CreateRatingDto,
    examples: {
      'Medium bewerten': {
        value: {
          rating: 4,
          comment: 'Ein sehr guter Film!'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Bewertung erfolgreich erstellt',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
        mediaId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
        rating: { type: 'number', example: 4 },
        comment: { type: 'string', example: 'Ein sehr guter Film!' },
        createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Ungültige Daten' })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Medium nicht gefunden' })
  async rateMedia(
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Body() createRatingDto: CreateRatingDto,
    @Request() req
  ) {
    this.logger.debug(
      `Bewerte Medium ${mediaId} mit ${createRatingDto.value} Sternen`,
      'RatingController'
    );
    const userId = req.user.id;
    return this.ratingService.rateMedia(userId, mediaId, createRatingDto);
  }

  @Get('media/:mediaId')
  @ApiOperation({ summary: 'Bewertungen für ein Medium abrufen' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste der Bewertungen für das Medium',
    schema: {
      type: 'object',
      properties: {
        averageRating: { type: 'number', example: 4.2 },
        totalRatings: { type: 'number', example: 15 },
        userRating: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
            rating: { type: 'number', example: 4 },
            comment: { type: 'string', example: 'Ein sehr guter Film!' },
            createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
          }
        },
        ratings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
              rating: { type: 'number', example: 4 },
              comment: { type: 'string', example: 'Ein sehr guter Film!' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
                  username: { type: 'string', example: 'benutzer123' }
                }
              },
              createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Medium nicht gefunden' })
  async getMediaRatings(@Param('mediaId', ParseUUIDPipe) mediaId: string, @Request() req) {
    this.logger.debug(`Rufe Bewertungen für Medium ${mediaId} ab`, 'RatingController');
    const userId = req.user.id;
    return this.ratingService.getMediaRatings(mediaId);
  }

  @Delete('media/:mediaId')
  @ApiOperation({ summary: 'Eigene Bewertung für ein Medium löschen' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Bewertung erfolgreich gelöscht',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Bewertung erfolgreich gelöscht' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Bewertung nicht gefunden' })
  async deleteRating(@Param('mediaId', ParseUUIDPipe) mediaId: string, @Request() req) {
    this.logger.debug(`Lösche Bewertung für Medium ${mediaId}`, 'RatingController');
    const userId = req.user.id;
    await this.ratingService.deleteRating(userId, mediaId);
    return { message: 'Bewertung erfolgreich gelöscht' };
  }

  @Get('user')
  @ApiOperation({ summary: 'Alle eigenen Bewertungen abrufen' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste aller eigenen Bewertungen',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
          rating: { type: 'number', example: 4 },
          comment: { type: 'string', example: 'Ein sehr guter Film!' },
          media: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
              title: { type: 'string', example: 'Beispielvideo' },
              thumbnailPath: { type: 'string', example: '/pfad/zum/thumbnail.jpg' },
              type: { type: 'string', example: 'movie' }
            }
          },
          createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  async getUserRatings(@Request() req) {
    this.logger.debug('Rufe alle Bewertungen des Benutzers ab', 'RatingController');
    const userId = req.user.id;
    return this.ratingService.getUserRatings(userId);
  }
} 