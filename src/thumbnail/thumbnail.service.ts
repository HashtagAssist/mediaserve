import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../media/entities/media.entity';
import { Library } from '../library/entities/library.entity';
import { LoggerService } from '../shared/services/logger.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fsPromises from 'fs/promises';
import * as fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { MediaType } from '../media/enums/media-type.enum';
import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';

const execAsync = promisify(exec);

@Injectable()
export class ThumbnailService {
  private readonly thumbnailsDir: string;
  private readonly ffmpegAvailable: boolean;

  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(Library)
    private libraryRepository: Repository<Library>,
    private logger: LoggerService,
    private configService: ConfigService,
  ) {
    this.thumbnailsDir = path.join(process.cwd(), 'thumbnails');
    this.ffmpegAvailable = this.configService.get<boolean>('FFMPEG_INSTALLED', false);
    this.ensureThumbnailDir();
  }

  private async ensureThumbnailDir() {
    try {
      await fsPromises.mkdir(this.thumbnailsDir, { recursive: true });
      this.logger.debug(`Thumbnail-Verzeichnis erstellt: ${this.thumbnailsDir}`, 'ThumbnailService');
    } catch (error) {
      this.logger.error(
        `Fehler beim Erstellen des Thumbnail-Verzeichnisses: ${error.message}`,
        error.stack,
        'ThumbnailService'
      );
    }
  }

  async getThumbnail(mediaId: string, res: Response): Promise<StreamableFile> {
    this.logger.debug(`Rufe Thumbnail für Medium ${mediaId} ab`, 'ThumbnailService');
    
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });
    
    if (!media) {
      this.logger.warn(`Medium ${mediaId} nicht gefunden`, 'ThumbnailService');
      throw new NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
    }
    
    // Prüfe, ob ein Thumbnail existiert
    const thumbnailPath = media.thumbnailPath || path.join(process.cwd(), 'assets', 'default-thumbnail.jpg');
    
    if (!fs.existsSync(thumbnailPath)) {
      this.logger.warn(`Thumbnail für Medium ${mediaId} nicht gefunden: ${thumbnailPath}`, 'ThumbnailService');
      throw new NotFoundException(`Thumbnail für Medium ${mediaId} nicht gefunden`);
    }
    
    // Setze den Content-Type basierend auf der Dateiendung
    const ext = path.extname(thumbnailPath).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
    
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${path.basename(thumbnailPath)}"`,
    });
    
    const fileStream = fs.createReadStream(thumbnailPath);
    return new StreamableFile(fileStream);
  }

  async generateThumbnail(mediaId: string): Promise<string> {
    this.logger.debug(`Generiere Thumbnail für Medium ${mediaId}`, 'ThumbnailService');
    
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });
    
    if (!media) {
      this.logger.warn(`Medium ${mediaId} nicht gefunden`, 'ThumbnailService');
      throw new NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
    }
    
    // Nur für Videos Thumbnails generieren
    if (media.type !== MediaType.MOVIE) {
      this.logger.debug(
        `Thumbnail-Generierung für Medium ${mediaId} übersprungen - kein Video`,
        'ThumbnailService'
      );
      return null;
    }

    try {
      const thumbnailFilename = `${media.id}.jpg`;
      const thumbnailPath = path.join(this.thumbnailsDir, thumbnailFilename);
      
      // Prüfen, ob Thumbnail bereits existiert
      try {
        await fsPromises.access(thumbnailPath);
        this.logger.debug(
          `Thumbnail für Medium ${mediaId} existiert bereits: ${thumbnailPath}`,
          'ThumbnailService'
        );
        
        // Aktualisiere den Pfad in der Datenbank, falls er noch nicht gesetzt ist
        if (!media.thumbnailPath) {
          media.thumbnailPath = thumbnailPath;
          await this.mediaRepository.save(media);
        }
        
        return thumbnailPath;
      } catch (error) {
        // Thumbnail existiert nicht, generiere es
      }

      // Extrahiere einen Frame aus der Mitte des Videos (bei 30% der Gesamtlänge)
      const command = media.duration 
        ? `ffmpeg -ss ${Math.floor(media.duration * 0.3)} -i "${media.path}" -vframes 1 -q:v 2 "${thumbnailPath}" -y`
        : `ffmpeg -i "${media.path}" -vframes 1 -q:v 2 "${thumbnailPath}" -y`;

      this.logger.debug(
        `Generiere Thumbnail für Medium ${mediaId} mit Befehl: ${command}`,
        'ThumbnailService'
      );

      await execAsync(command);
      
      // Prüfe, ob das Thumbnail erfolgreich erstellt wurde
      await fsPromises.access(thumbnailPath);
      
      // Aktualisiere den Pfad in der Datenbank
      media.thumbnailPath = thumbnailPath;
      await this.mediaRepository.save(media);
      
      this.logger.debug(
        `Thumbnail für Medium ${mediaId} erfolgreich generiert: ${thumbnailPath}`,
        'ThumbnailService'
      );
      
      return thumbnailPath;
    } catch (error) {
      this.logger.error(
        `Fehler bei der Thumbnail-Generierung für Medium ${mediaId}: ${error.message}`,
        error.stack,
        'ThumbnailService'
      );
      throw new InternalServerErrorException(`Fehler bei der Thumbnail-Generierung: ${error.message}`);
    }
  }

  async saveThumbnail(mediaId: string, file: any): Promise<string> {
    this.logger.debug(`Speichere hochgeladenes Thumbnail für Medium ${mediaId}`, 'ThumbnailService');
    
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });
    
    if (!media) {
      this.logger.warn(`Medium ${mediaId} nicht gefunden`, 'ThumbnailService');
      throw new NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
    }
    
    // Stelle sicher, dass das Verzeichnis existiert
    const thumbnailDir = path.join(process.cwd(), 'thumbnails');
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    
    // Speichere die hochgeladene Datei
    const thumbnailPath = path.join(thumbnailDir, `${mediaId}${path.extname(file.originalname)}`);
    await fsPromises.writeFile(thumbnailPath, file.buffer);
    
    // Aktualisiere den Thumbnail-Pfad im Medium
    media.thumbnailPath = thumbnailPath;
    await this.mediaRepository.save(media);
    
    return thumbnailPath;
  }

  async generateThumbnailsForLibrary(libraryId: string): Promise<number> {
    this.logger.debug(`Generiere Thumbnails für Bibliothek ${libraryId}`, 'ThumbnailService');
    
    const library = await this.libraryRepository.findOne({
      where: { id: libraryId },
    });
    
    if (!library) {
      this.logger.warn(`Bibliothek ${libraryId} nicht gefunden`, 'ThumbnailService');
      throw new NotFoundException(`Bibliothek mit ID ${libraryId} nicht gefunden`);
    }
    
    // Finde alle Medien in der Bibliothek ohne Thumbnail
    const media = await this.mediaRepository.find({
      where: {
        library: { id: libraryId },
        type: MediaType.MOVIE,
        thumbnailPath: null,
      },
    });
    
    let count = 0;
    
    // Generiere Thumbnails für jedes Medium
    for (const item of media) {
      try {
        await this.generateThumbnail(item.id);
        count++;
      } catch (error) {
        this.logger.error(
          `Fehler bei der Thumbnail-Generierung für Medium ${item.id}: ${error.message}`,
          error.stack,
          'ThumbnailService'
        );
      }
    }
    
    return count;
  }
} 