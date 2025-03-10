import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../shared/services/logger.service';
import { User } from '../auth/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Benutzer')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Alle Benutzer abrufen' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste aller Benutzer',
    type: [User],
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'benutzer@beispiel.de',
          username: 'benutzer123',
          createdAt: '2025-03-10T12:00:00Z',
          updatedAt: '2025-03-10T12:00:00Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  async findAll() {
    this.logger.debug('GET /users Anfrage erhalten', 'UserController');
    try {
      const users = await this.userService.findAll();
      this.logger.debug(`${users.length} Benutzer erfolgreich abgerufen`, 'UserController');
      return users;
    } catch (error) {
      this.logger.error(
        `Fehler beim Abrufen aller Benutzer: ${error.message}`,
        error.stack,
        'UserController'
      );
      throw new InternalServerErrorException('Fehler beim Abrufen der Benutzer');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Einen Benutzer abrufen' })
  @ApiParam({ name: 'id', description: 'ID des Benutzers', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Der gefundene Benutzer',
    type: User,
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'benutzer@beispiel.de',
        username: 'benutzer123',
        createdAt: '2025-03-10T12:00:00Z',
        updatedAt: '2025-03-10T12:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Benutzer nicht gefunden' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`GET /users/${id} Anfrage erhalten`, 'UserController');
    try {
      const user = await this.userService.findOne(id);
      this.logger.debug(`Benutzer ${id} erfolgreich abgerufen`, 'UserController');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`Benutzer ${id} nicht gefunden`, 'UserController');
        throw error;
      }
      this.logger.error(
        `Fehler beim Abrufen des Benutzers ${id}: ${error.message}`,
        error.stack,
        'UserController'
      );
      throw new InternalServerErrorException('Fehler beim Abrufen des Benutzers');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Benutzer aktualisieren' })
  @ApiParam({ name: 'id', description: 'ID des Benutzers', type: 'string' })
  @ApiBody({ 
    type: UpdateUserDto,
    examples: {
      'Benutzerdaten aktualisieren': {
        value: {
          username: 'neuer_benutzername',
          email: 'neue_email@beispiel.de'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Aktualisierter Benutzer',
    type: User
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Benutzer nicht gefunden' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    this.logger.debug(`PUT /users/${id} Anfrage erhalten`, 'UserController');
    try {
      const updatedUser = await this.userService.update(id, updateUserDto);
      this.logger.debug(`Benutzer ${id} erfolgreich aktualisiert`, 'UserController');
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`Benutzer ${id} nicht gefunden`, 'UserController');
        throw error;
      }
      this.logger.error(
        `Fehler beim Aktualisieren des Benutzers ${id}: ${error.message}`,
        error.stack,
        'UserController'
      );
      throw new InternalServerErrorException('Fehler beim Aktualisieren des Benutzers');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Benutzer löschen' })
  @ApiParam({ name: 'id', description: 'ID des Benutzers', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Benutzer erfolgreich gelöscht',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Benutzer erfolgreich gelöscht' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Benutzer nicht gefunden' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.debug(`DELETE /users/${id} Anfrage erhalten`, 'UserController');
    try {
      await this.userService.remove(id);
      this.logger.debug(`Benutzer ${id} erfolgreich gelöscht`, 'UserController');
      return { message: 'Benutzer erfolgreich gelöscht' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`Benutzer ${id} nicht gefunden`, 'UserController');
        throw error;
      }
      this.logger.error(
        `Fehler beim Löschen des Benutzers ${id}: ${error.message}`,
        error.stack,
        'UserController'
      );
      throw new InternalServerErrorException('Fehler beim Löschen des Benutzers');
    }
  }
} 