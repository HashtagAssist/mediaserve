import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '../shared/services/logger.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private logger: LoggerService,
  ) {}

  async register(registerDto: RegisterDto) {
    this.logger.debug(`Registrierungsversuch für E-Mail: ${registerDto.email}`, 'AuthService');
    try {
      // Überprüfen, ob Benutzer bereits existiert
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: registerDto.email },
          { username: registerDto.username },
        ],
      });

      if (existingUser) {
        this.logger.warn(
          `Registrierung fehlgeschlagen - Benutzer existiert bereits: ${registerDto.email}`,
          'AuthService'
        );
        throw new ConflictException('Email oder Benutzername bereits vergeben');
      }

      // Passwort hashen
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Neuen Benutzer erstellen
      const user = this.userRepository.create({
        ...registerDto,
        password: hashedPassword,
      });

      await this.userRepository.save(user);
      this.logger.debug(`Benutzer erfolgreich registriert: ${user.email}`, 'AuthService');

      // Passwort aus der Antwort entfernen
      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(
        `Registrierungsfehler für ${registerDto.email}: ${error.message}`,
        error.stack,
        'AuthService'
      );
      throw new InternalServerErrorException('Registrierung fehlgeschlagen');
    }
  }

  async login(loginDto: LoginDto) {
    this.logger.debug(`Anmeldeversuch für E-Mail: ${loginDto.email}`, 'AuthService');
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
      });

      if (!user) {
        this.logger.warn(`Anmeldeversuch fehlgeschlagen - Benutzer nicht gefunden: ${loginDto.email}`, 'AuthService');
        throw new UnauthorizedException('Ungültige Anmeldedaten');
      }

      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

      if (!isPasswordValid) {
        this.logger.warn(`Anmeldeversuch fehlgeschlagen - Falsches Passwort: ${loginDto.email}`, 'AuthService');
        throw new UnauthorizedException('Ungültige Anmeldedaten');
      }

      const payload = { sub: user.id, email: user.email };
      const token = this.jwtService.sign(payload);
      
      this.logger.debug(`Benutzer erfolgreich angemeldet: ${user.email}`, 'AuthService');
      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `Anmeldefehler für ${loginDto.email}: ${error.message}`,
        error.stack,
        'AuthService'
      );
      throw new InternalServerErrorException('Anmeldung fehlgeschlagen');
    }
  }
} 