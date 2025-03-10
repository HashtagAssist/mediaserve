import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { LoggerService } from '../shared/services/logger.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private logger: LoggerService,
  ) {}

  async findAll() {
    this.logger.debug('Suche alle Benutzer', 'UserService');
    try {
      const users = await this.userRepository.find({
        select: ['id', 'email', 'username', 'createdAt', 'updatedAt'],
      });
      this.logger.debug(`${users.length} Benutzer gefunden`, 'UserService');
      return users;
    } catch (error) {
      this.logger.error(
        `Fehler beim Abrufen aller Benutzer: ${error.message}`,
        error.stack,
        'UserService'
      );
      throw new InternalServerErrorException('Fehler beim Abrufen der Benutzer');
    }
  }

  async findOne(id: string) {
    this.logger.debug(`Suche Benutzer mit ID: ${id}`, 'UserService');
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: ['id', 'email', 'username', 'createdAt', 'updatedAt'],
      });

      if (!user) {
        this.logger.warn(`Benutzer mit ID ${id} nicht gefunden`, 'UserService');
        throw new NotFoundException(`Benutzer mit ID ${id} nicht gefunden`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Fehler beim Abrufen des Benutzers ${id}: ${error.message}`,
        error.stack,
        'UserService'
      );
      throw new InternalServerErrorException('Fehler beim Abrufen des Benutzers');
    }
  }

  async findByEmail(email: string) {
    this.logger.debug(`Suche Benutzer mit E-Mail: ${email}`, 'UserService');
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'username', 'createdAt', 'updatedAt'],
      });

      if (!user) {
        this.logger.warn(`Benutzer mit E-Mail ${email} nicht gefunden`, 'UserService');
        throw new NotFoundException(`Benutzer mit E-Mail ${email} nicht gefunden`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Fehler beim Abrufen des Benutzers mit E-Mail ${email}: ${error.message}`,
        error.stack,
        'UserService'
      );
      throw new InternalServerErrorException('Fehler beim Abrufen des Benutzers');
    }
  }

  async remove(id: string) {
    this.logger.debug(`Lösche Benutzer mit ID: ${id}`, 'UserService');
    try {
      const result = await this.userRepository.delete(id);
      
      if (result.affected === 0) {
        this.logger.warn(`Benutzer mit ID ${id} nicht gefunden`, 'UserService');
        throw new NotFoundException(`Benutzer mit ID ${id} nicht gefunden`);
      }

      this.logger.debug(`Benutzer ${id} erfolgreich gelöscht`, 'UserService');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Fehler beim Löschen des Benutzers ${id}: ${error.message}`,
        error.stack,
        'UserService'
      );
      throw new InternalServerErrorException('Fehler beim Löschen des Benutzers');
    }
  }

  async update(id: string, updateData: Partial<User>) {
    this.logger.debug(`Aktualisiere Benutzer mit ID: ${id}`, 'UserService');
    try {
      const user = await this.userRepository.findOne({ 
        where: { id },
        select: ['id', 'email', 'username', 'password', 'createdAt', 'updatedAt'],
      });

      if (!user) {
        this.logger.warn(`Benutzer mit ID ${id} nicht gefunden`, 'UserService');
        throw new NotFoundException(`Benutzer mit ID ${id} nicht gefunden`);
      }

      // Passwort-Updates müssen separat behandelt werden
      if (updateData.password) {
        this.logger.warn(
          `Versuch, das Passwort über die Update-Methode zu ändern wurde blockiert`,
          'UserService'
        );
        delete updateData.password;
      }

      Object.assign(user, updateData);
      const updatedUser = await this.userRepository.save(user);
      this.logger.debug(`Benutzer ${id} erfolgreich aktualisiert`, 'UserService');

      const { password, ...result } = updatedUser;
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Fehler beim Aktualisieren des Benutzers ${id}: ${error.message}`,
        error.stack,
        'UserService'
      );
      throw new InternalServerErrorException('Fehler beim Aktualisieren des Benutzers');
    }
  }
} 