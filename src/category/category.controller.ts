import {
  Controller,
  Post,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Get,
  Put,
  Delete,
  Body,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../shared/services/logger.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Kategorien')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Neue Kategorie erstellen' })
  @ApiBody({ 
    type: CreateCategoryDto,
    examples: {
      'Neue Kategorie': {
        value: {
          name: 'Action',
          description: 'Actionfilme und -serien'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Kategorie erfolgreich erstellt',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        name: { type: 'string', example: 'Action' },
        description: { type: 'string', example: 'Actionfilme und -serien' },
        createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Ungültige Daten' })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    this.logger.debug(`Erstelle neue Kategorie: ${createCategoryDto.name}`, 'CategoryController');
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Alle Kategorien abrufen' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste aller Kategorien',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
          name: { type: 'string', example: 'Action' },
          description: { type: 'string', example: 'Actionfilme und -serien' },
          mediaCount: { type: 'number', example: 42 },
          createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  async findAll() {
    this.logger.debug('Rufe alle Kategorien ab', 'CategoryController');
    return this.categoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Eine Kategorie abrufen' })
  @ApiParam({ name: 'id', description: 'ID der Kategorie', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Die gefundene Kategorie',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        name: { type: 'string', example: 'Action' },
        description: { type: 'string', example: 'Actionfilme und -serien' },
        media: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
              title: { type: 'string', example: 'Beispielfilm' },
              thumbnailPath: { type: 'string', example: '/pfad/zum/thumbnail.jpg' }
            }
          }
        },
        createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Kategorie nicht gefunden' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Rufe Kategorie ab: ${id}`, 'CategoryController');
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Kategorie aktualisieren' })
  @ApiParam({ name: 'id', description: 'ID der Kategorie', type: 'string' })
  @ApiBody({ 
    type: UpdateCategoryDto,
    examples: {
      'Kategorie aktualisieren': {
        value: {
          name: 'Action & Abenteuer',
          description: 'Action- und Abenteuerfilme'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Kategorie erfolgreich aktualisiert',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        name: { type: 'string', example: 'Action & Abenteuer' },
        description: { type: 'string', example: 'Action- und Abenteuerfilme' },
        updatedAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Ungültige Daten' })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Kategorie nicht gefunden' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    this.logger.debug(`Aktualisiere Kategorie: ${id}`, 'CategoryController');
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kategorie löschen' })
  @ApiParam({ name: 'id', description: 'ID der Kategorie', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kategorie erfolgreich gelöscht',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Kategorie erfolgreich gelöscht' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Kategorie nicht gefunden' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Lösche Kategorie: ${id}`, 'CategoryController');
    await this.categoryService.remove(id);
    return { message: 'Kategorie erfolgreich gelöscht' };
  }

  @Post(':id/media/:mediaId')
  @ApiOperation({ summary: 'Medium zu Kategorie hinzufügen' })
  @ApiParam({ name: 'id', description: 'ID der Kategorie', type: 'string' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Medium erfolgreich zur Kategorie hinzugefügt',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Medium erfolgreich zur Kategorie hinzugefügt' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Kategorie oder Medium nicht gefunden' })
  async addMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ) {
    this.logger.debug(`Füge Medium ${mediaId} zur Kategorie ${id} hinzu`, 'CategoryController');
    await this.categoryService.addMedia(id, mediaId);
    return { message: 'Medium erfolgreich zur Kategorie hinzugefügt' };
  }

  @Delete(':id/media/:mediaId')
  @ApiOperation({ summary: 'Medium aus Kategorie entfernen' })
  @ApiParam({ name: 'id', description: 'ID der Kategorie', type: 'string' })
  @ApiParam({ name: 'mediaId', description: 'ID des Mediums', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Medium erfolgreich aus Kategorie entfernt',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Medium erfolgreich aus Kategorie entfernt' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Kategorie oder Medium nicht gefunden' })
  async removeMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ) {
    this.logger.debug(`Entferne Medium ${mediaId} aus Kategorie ${id}`, 'CategoryController');
    await this.categoryService.removeMedia(id, mediaId);
    return { message: 'Medium erfolgreich aus Kategorie entfernt' };
  }
} 