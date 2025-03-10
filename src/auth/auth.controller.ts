import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  InternalServerErrorException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoggerService } from '../shared/services/logger.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentifizierung')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrieren', description: 'Erstellt einen neuen Benutzer.' })
  @ApiBody({ 
    type: RegisterDto,
    examples: {
      'Neue Registrierung': {
        value: {
          email: 'neu@beispiel.de',
          password: 'sicheres_passwort123',
          username: 'neuerbenutzer'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Benutzer erfolgreich registriert',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        email: { type: 'string', example: 'neu@beispiel.de' },
        username: { type: 'string', example: 'neuerbenutzer' },
        createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Ungültige Daten' })
  @ApiResponse({ status: 409, description: 'E-Mail oder Benutzername bereits vergeben' })
  async register(@Body() registerDto: RegisterDto) {
    this.logger.debug(`Registrierungsversuch für: ${registerDto.email}`, 'AuthController');
    try {
      const result = await this.authService.register(registerDto);
      this.logger.debug(`Registrierung erfolgreich: ${registerDto.email}`, 'AuthController');
      return result;
    } catch (error) {
      if (error instanceof ConflictException) {
        this.logger.warn(
          `Registrierung fehlgeschlagen - Benutzer existiert bereits: ${registerDto.email}`,
          'AuthController'
        );
        throw error;
      }
      this.logger.error(
        `Registrierungsfehler für ${registerDto.email}: ${error.message}`,
        error.stack,
        'AuthController'
      );
      throw new InternalServerErrorException('Registrierung fehlgeschlagen');
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Anmelden', description: 'Meldet einen Benutzer an und gibt ein JWT-Token zurück.' })
  @ApiBody({ 
    type: LoginDto,
    examples: {
      'Standard-Login': {
        value: {
          email: 'benutzer@beispiel.de',
          password: 'passwort123'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Erfolgreich angemeldet',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
            email: { type: 'string', example: 'benutzer@beispiel.de' },
            username: { type: 'string', example: 'benutzer123' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Ungültige Anmeldedaten' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    this.logger.debug(`Anmeldeversuch für: ${loginDto.email}`, 'AuthController');
    try {
      const result = await this.authService.login(loginDto);
      this.logger.debug(`Anmeldung erfolgreich: ${loginDto.email}`, 'AuthController');
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.warn(
          `Anmeldeversuch fehlgeschlagen für: ${loginDto.email}`,
          'AuthController'
        );
        throw error;
      }
      this.logger.error(
        `Anmeldefehler für ${loginDto.email}: ${error.message}`,
        error.stack,
        'AuthController'
      );
      throw new InternalServerErrorException('Anmeldung fehlgeschlagen');
    }
  }
} 