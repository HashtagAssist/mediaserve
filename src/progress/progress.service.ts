import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progress } from './entities/progress.entity';
import { Media } from '../media/entities/media.entity';
import { User } from '../user/entities/user.entity';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { CreateProgressDto } from './dto/create-progress.dto';

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userId: string, createProgressDto: CreateProgressDto): Promise<Progress> {
    this.logger.debug(
      `Speichere Fortschritt für Benutzer ${userId}, Medium ${createProgressDto.mediaId}`,
      'ProgressService'
    );

    // Prüfe, ob Medium existiert
    const media = await this.mediaRepository.findOne({ where: { id: createProgressDto.mediaId } });
    if (!media) {
      throw new NotFoundException(`Medium mit ID ${createProgressDto.mediaId} nicht gefunden`);
    }

    // Prüfe, ob Benutzer existiert
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Benutzer mit ID ${userId} nicht gefunden`);
    }

    // Stelle sicher, dass position und duration nicht negativ sind
    if (createProgressDto.position < 0 || createProgressDto.duration < 0) {
      throw new BadRequestException('Position und Dauer müssen positive Werte sein');
    }

    // Prüfe, ob bereits ein Fortschritt existiert
    const existingProgress = await this.progressRepository.findOne({
      where: {
        user: { id: userId },
        media: { id: createProgressDto.mediaId },
      },
      relations: ['user', 'media'],
    });

    if (existingProgress) {
      // Aktualisiere bestehenden Fortschritt
      existingProgress.position = createProgressDto.position;
      existingProgress.duration = createProgressDto.duration;
      
      // Aktualisiere playCount und lastPlayedAt
      existingProgress.playCount += 1;
      existingProgress.lastPlayedAt = new Date();
      
      if (createProgressDto.completed !== undefined) {
        existingProgress.completed = createProgressDto.completed;
      } else {
        // Automatisch als abgeschlossen markieren, wenn Position nahe am Ende
        const completionThreshold = 0.95; // 95% der Gesamtdauer
        existingProgress.completed = 
          existingProgress.position >= existingProgress.duration * completionThreshold;
      }
      
      const savedProgress = await this.progressRepository.save(existingProgress);
      this.logger.debug(
        `Fortschritt aktualisiert: ${savedProgress.position}s / ${savedProgress.duration}s`,
        'ProgressService'
      );
      return savedProgress;
    }

    // Erstelle neuen Fortschritt
    const progress = this.progressRepository.create({
      user,
      media,
      position: createProgressDto.position,
      duration: createProgressDto.duration,
      completed: createProgressDto.completed || false,
      playCount: 1,
      lastPlayedAt: new Date(),
    });

    const savedProgress = await this.progressRepository.save(progress);
    this.logger.debug(
      `Neuer Fortschritt gespeichert: ${savedProgress.position}s / ${savedProgress.duration}s`,
      'ProgressService'
    );
    return savedProgress;
  }

  async findAllByUser(userId: string): Promise<Progress[]> {
    this.logger.debug(`Suche alle Fortschritte für Benutzer ${userId}`, 'ProgressService');
    
    const progress = await this.progressRepository.find({
      where: { user: { id: userId } },
      relations: ['media'],
      order: { lastPlayedAt: 'DESC' },
    });
    
    this.logger.debug(`${progress.length} Fortschritte gefunden`, 'ProgressService');
    return progress;
  }

  async findContinueWatching(userId: string, limit = 10): Promise<Progress[]> {
    this.logger.debug(
      `Suche "Weiterschauen"-Elemente für Benutzer ${userId}`,
      'ProgressService'
    );
    
    const progress = await this.progressRepository.find({
      where: {
        user: { id: userId },
        completed: false,
      },
      relations: ['media'],
      order: { updatedAt: 'DESC' },
      take: limit,
    });
    
    this.logger.debug(`${progress.length} "Weiterschauen"-Elemente gefunden`, 'ProgressService');
    return progress;
  }

  async findOne(userId: string, mediaId: string): Promise<Progress> {
    this.logger.debug(
      `Suche Fortschritt für Benutzer ${userId}, Medium ${mediaId}`,
      'ProgressService'
    );
    
    const progress = await this.progressRepository.findOne({
      where: {
        user: { id: userId },
        media: { id: mediaId },
      },
      relations: ['media'],
    });
    
    if (!progress) {
      this.logger.debug(
        `Kein Fortschritt gefunden für Benutzer ${userId}, Medium ${mediaId}`,
        'ProgressService'
      );
      return null;
    }
    
    return progress;
  }

  async remove(userId: string, mediaId: string): Promise<void> {
    this.logger.debug(
      `Lösche Fortschritt für Benutzer ${userId}, Medium ${mediaId}`,
      'ProgressService'
    );
    
    const result = await this.progressRepository.delete({
      user: { id: userId },
      media: { id: mediaId },
    });
    
    if (result.affected === 0) {
      throw new NotFoundException(
        `Fortschritt für Benutzer ${userId}, Medium ${mediaId} nicht gefunden`
      );
    }
    
    this.logger.debug(
      `Fortschritt erfolgreich gelöscht für Benutzer ${userId}, Medium ${mediaId}`,
      'ProgressService'
    );
  }

  async getProgress(userId: string, mediaId: string): Promise<Progress> {
    try {
      return await this.findOne(userId, mediaId);
    } catch (error) {
      this.logger.error(
        `Fehler beim Abrufen des Fortschritts für Benutzer ${userId}, Medium ${mediaId}: ${error.message}`,
        error.stack,
        'ProgressService'
      );
      throw error;
    }
  }

  async update(userId: string, mediaId: string, updateProgressDto: UpdateProgressDto): Promise<Progress> {
    this.logger.debug(
      `Aktualisiere Fortschritt für Benutzer ${userId}, Medium ${mediaId}`,
      'ProgressService'
    );
    
    const progress = await this.findOne(userId, mediaId);
    if (!progress) {
      throw new NotFoundException(`Fortschritt für Benutzer ${userId}, Medium ${mediaId} nicht gefunden`);
    }
    
    // Aktualisiere die Felder
    if (updateProgressDto.position !== undefined) {
      progress.position = updateProgressDto.position;
    }
    
    if (updateProgressDto.duration !== undefined) {
      progress.duration = updateProgressDto.duration;
    }
    
    if (updateProgressDto.completed !== undefined) {
      progress.completed = updateProgressDto.completed;
    } else if (updateProgressDto.position !== undefined && progress.duration) {
      // Automatisch als abgeschlossen markieren, wenn Position nahe am Ende
      const completionThreshold = 0.95; // 95% der Gesamtdauer
      progress.completed = progress.position >= progress.duration * completionThreshold;
    }
    
    // Aktualisiere lastPlayedAt
    progress.lastPlayedAt = new Date();
    
    const savedProgress = await this.progressRepository.save(progress);
    this.logger.debug(
      `Fortschritt aktualisiert: ${savedProgress.position}s / ${savedProgress.duration}s`,
      'ProgressService'
    );
    return savedProgress;
  }

  async updateMediaProgress(userId: string, mediaId: string, updateProgressDto: UpdateProgressDto): Promise<Progress> {
    // Implementierung hier
    // Kann die vorhandene Methode aufrufen oder eigene Logik haben
    return this.update(userId, mediaId, updateProgressDto);
  }

  async getAllUserProgress(userId: string): Promise<Progress[]> {
    return this.getUserProgress(userId);
  }

  // Falls getContinueWatching nicht existiert, aber findContinueWatching schon
  async getContinueWatching(userId: string): Promise<Progress[]> {
    return this.findContinueWatching(userId);
  }

  async getUserProgress(userId: string): Promise<Progress[]> {
    this.logger.debug(
      `Rufe alle Fortschritte für Benutzer ${userId} ab`,
      'ProgressService'
    );
    
    try {
      return await this.progressRepository.find({
        where: { user: { id: userId } },
        relations: ['media'],
        order: { lastPlayedAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(
        `Fehler beim Abrufen aller Fortschritte für Benutzer ${userId}: ${error.message}`,
        error.stack,
        'ProgressService'
      );
      throw error;
    }
  }
} 