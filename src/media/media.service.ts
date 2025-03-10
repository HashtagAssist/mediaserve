import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Media } from './entities/media.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediaType } from './enums/media-type.enum';
import { MetadataService } from '../metadata/metadata.service';
import { LoggerService } from '../shared/services/logger.service';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    private metadataService: MetadataService,
    private logger: LoggerService,
  ) {}

  async create(createMediaDto: CreateMediaDto): Promise<Media> {
    this.logger.debug(`Erstelle neues Medium: ${createMediaDto.title}`, 'MediaService');
    try {
      const media = this.mediaRepository.create(createMediaDto);
      const savedMedia = await this.mediaRepository.save(media);
      
      // Extrahiere Metadaten asynchron
      try {
        await this.metadataService.extractMetadata(savedMedia.id);
      } catch (error) {
        this.logger.error(
          `Fehler bei der Metadatenextraktion für Medium ${savedMedia.id}`,
          error.stack,
          'MediaService'
        );
      }

      this.logger.debug(`Medium erfolgreich erstellt: ${savedMedia.id}`, 'MediaService');
      return savedMedia;
    } catch (error) {
      this.logger.error(
        `Fehler beim Erstellen des Mediums: ${error.message}`,
        error.stack,
        'MediaService'
      );
      throw new InternalServerErrorException(`Fehler beim Erstellen des Mediums: ${error.message}`);
    }
  }

  async findAll(type?: MediaType): Promise<Media[]> {
    this.logger.debug(`Suche alle Medien${type ? ` vom Typ ${type}` : ''}`, 'MediaService');
    try {
      const media = type 
        ? await this.mediaRepository.find({ where: { type } })
        : await this.mediaRepository.find();
      this.logger.debug(`${media.length} Medien gefunden`, 'MediaService');
      return media;
    } catch (error) {
      this.logger.error(
        `Fehler beim Abrufen der Medien: ${error.message}`,
        error.stack,
        'MediaService'
      );
      throw new InternalServerErrorException(`Datenbankfehler: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Media> {
    this.logger.debug(`Suche Medium mit ID: ${id}`, 'MediaService');
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      this.logger.warn(`Medium mit ID ${id} nicht gefunden`, 'MediaService');
      throw new NotFoundException(`Medium mit ID ${id} nicht gefunden`);
    }
    return media;
  }

  async update(id: string, updateMediaDto: UpdateMediaDto): Promise<Media> {
    this.logger.debug(`Aktualisiere Medium ${id}`, 'MediaService');
    try {
      const media = await this.findOne(id);
      Object.assign(media, updateMediaDto);
      const updatedMedia = await this.mediaRepository.save(media);
      this.logger.debug(`Medium ${id} erfolgreich aktualisiert`, 'MediaService');
      return updatedMedia;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Fehler beim Aktualisieren des Mediums ${id}: ${error.message}`,
        error.stack,
        'MediaService'
      );
      throw new InternalServerErrorException(`Datenbankfehler: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.debug(`Lösche Medium ${id}`, 'MediaService');
    try {
      const result = await this.mediaRepository.delete(id);
      if (result.affected === 0) {
        this.logger.warn(`Medium mit ID ${id} nicht gefunden`, 'MediaService');
        throw new NotFoundException(`Medium mit ID ${id} nicht gefunden`);
      }
      this.logger.debug(`Medium ${id} erfolgreich gelöscht`, 'MediaService');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Fehler beim Löschen des Mediums ${id}: ${error.message}`,
        error.stack,
        'MediaService'
      );
      throw new InternalServerErrorException(`Datenbankfehler: ${error.message}`);
    }
  }

  async search(query: string): Promise<Media[]> {
    this.logger.debug(`Suche Medien mit Query: ${query}`, 'MediaService');
    try {
      const media = await this.mediaRepository.find({
        where: [
          { title: Like(`%${query}%`) },
          { description: Like(`%${query}%`) },
        ],
      });
      this.logger.debug(`${media.length} Medien gefunden für Query: ${query}`, 'MediaService');
      return media;
    } catch (error) {
      this.logger.error(
        `Fehler bei der Mediensuche: ${error.message}`,
        error.stack,
        'MediaService'
      );
      throw new InternalServerErrorException(`Datenbankfehler: ${error.message}`);
    }
  }

  async findByGenre(genre: string): Promise<Media[]> {
    this.logger.debug(`Suche Medien nach Genre: ${genre}`, 'MediaService');
    try {
      const media = await this.mediaRepository
        .createQueryBuilder('media')
        .where(':genre = ANY(media.genres)', { genre })
        .getMany();
      this.logger.debug(`${media.length} Medien gefunden für Genre: ${genre}`, 'MediaService');
      return media;
    } catch (error) {
      this.logger.error(
        `Fehler bei der Genre-Suche: ${error.message}`,
        error.stack,
        'MediaService'
      );
      throw new InternalServerErrorException(`Datenbankfehler: ${error.message}`);
    }
  }

  async findByYear(year: number): Promise<Media[]> {
    this.logger.debug(`Suche Medien aus dem Jahr ${year}`, 'MediaService');
    return this.mediaRepository.find({
      where: { releaseYear: year },
    });
  }

  async markAsProcessed(id: string): Promise<Media> {
    this.logger.debug(`Markiere Medium ${id} als verarbeitet`, 'MediaService');
    try {
      const media = await this.findOne(id);
      media.processed = true;
      const updatedMedia = await this.mediaRepository.save(media);
      this.logger.debug(`Medium ${id} erfolgreich als verarbeitet markiert`, 'MediaService');
      return updatedMedia;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Fehler beim Markieren des Mediums als verarbeitet: ${error.message}`,
        error.stack,
        'MediaService'
      );
      throw new InternalServerErrorException(`Datenbankfehler: ${error.message}`);
    }
  }

  async importDirectory(directoryPath: string): Promise<Media[]> {
    this.logger.debug(`Importiere Medien aus Verzeichnis: ${directoryPath}`, 'MediaService');
    try {
      const mediaFiles = await this.metadataService.analyzeDirectory(directoryPath);
      const createdMedia: Media[] = [];

      for (const file of mediaFiles) {
        try {
          const media = await this.create({
            title: file.title,
            path: file.path,
            type: file.type,
          });
          createdMedia.push(media);
          this.logger.debug(`Medium erfolgreich importiert: ${file.path}`, 'MediaService');
        } catch (error) {
          this.logger.error(
            `Fehler beim Importieren von ${file.path}: ${error.message}`,
            error.stack,
            'MediaService'
          );
        }
      }

      this.logger.debug(
        `Import abgeschlossen. ${createdMedia.length} von ${mediaFiles.length} Medien erfolgreich importiert`,
        'MediaService'
      );
      return createdMedia;
    } catch (error) {
      this.logger.error(
        `Fehler beim Verzeichnisimport: ${error.message}`,
        error.stack,
        'MediaService'
      );
      throw new InternalServerErrorException(`Import-Fehler: ${error.message}`);
    }
  }
} 