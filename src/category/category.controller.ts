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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Neue Kategorie erstellen' })
  @ApiResponse({ 
    status: 201, 
    description: 'Kategorie wurde erstellt',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      }
    }
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
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
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        }
      }
    }
  })
  findAll() {
    this.logger.debug('Abrufen aller Kategorien', 'CategoryController');
    return this.categoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kategorie nach ID abrufen' })
  @ApiParam({ name: 'id', description: 'Kategorie-ID', type: 'string', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kategorie gefunden',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        media: { 
          type: 'array', 
          items: { 
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
            }
          } 
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Kategorie nicht gefunden' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Abrufen der Kategorie mit ID: ${id}`, 'CategoryController');
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Kategorie aktualisieren' })
  @ApiParam({ name: 'id', description: 'Kategorie-ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Kategorie wurde aktualisiert' })
  @ApiResponse({ status: 404, description: 'Kategorie nicht gefunden' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    this.logger.debug(`Aktualisiere Kategorie mit ID: ${id}`, 'CategoryController');
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kategorie löschen' })
  @ApiParam({ name: 'id', description: 'Kategorie-ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Kategorie wurde gelöscht' })
  @ApiResponse({ status: 404, description: 'Kategorie nicht gefunden' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Lösche Kategorie mit ID: ${id}`, 'CategoryController');
    return this.categoryService.remove(id);
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

  @Post('media/:id/categorize')
  @ApiOperation({ summary: 'Medium automatisch kategorisieren' })
  @ApiParam({ name: 'id', description: 'Medien-ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Medium wurde kategorisiert' })
  @ApiResponse({ status: 404, description: 'Medium nicht gefunden' })
  categorizeMedia(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`Kategorisiere Medium mit ID: ${id}`, 'CategoryController');
    return this.categoryService.categorizeMedia(id);
  }
} 