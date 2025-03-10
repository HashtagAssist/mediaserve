import { Injectable, NotFoundException, ForbiddenException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../media/entities/media.entity';
import { User } from '../user/entities/user.entity';
import { LoggerService } from '../shared/services/logger.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream, stat } from 'fs';
import { promisify } from 'util';
import { Response } from 'express';
import { ProgressService } from '../progress/progress.service';

const statAsync = promisify(stat);

@Injectable()
export class StreamingService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    private logger: LoggerService,
    private configService: ConfigService,
    private progressService: ProgressService,
  ) {}

  async streamMedia(
    mediaId: string,
    userId: string,
    response: Response,
    range?: string,
  ): Promise<StreamableFile | void> {
    this.logger.debug(
      `Streaming-Anfrage für Medium ${mediaId} von Benutzer ${userId}${range ? ' mit Range: ' + range : ''}`,
      'StreamingService'
    );
    
    // Finde das Medium
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
      relations: ['library'],
    });
    
    if (!media) {
      throw new NotFoundException(`Medium ${mediaId} nicht gefunden`);
    }
    
    const filePath = media.path;
    
    // Prüfe, ob die Datei existiert
    try {
      await statAsync(filePath);
    } catch (error) {
      this.logger.error(
        `Datei nicht gefunden: ${filePath}`,
        error.stack,
        'StreamingService'
      );
      throw new NotFoundException(`Datei nicht gefunden: ${filePath}`);
    }
    
    // Ermittle den MIME-Typ basierend auf dem Dateityp
    const mimeType = this.getMimeType(filePath);
    
    // Ermittle die Dateigröße
    const { size } = await statAsync(filePath);
    
    // Wenn ein Range-Header vorhanden ist, streame nur den angeforderten Teil
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
      const chunkSize = end - start + 1;
      
      this.logger.debug(
        `Streaming-Range: ${start}-${end}/${size} (${chunkSize} Bytes)`,
        'StreamingService'
      );
      
      response.status(206);
      response.set({
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeType,
      });
      
      const stream = createReadStream(filePath, { start, end });
      return new StreamableFile(stream);
    }
    
    // Wenn kein Range-Header vorhanden ist, streame die gesamte Datei
    this.logger.debug(
      `Streaming gesamte Datei: ${size} Bytes`,
      'StreamingService'
    );
    
    response.set({
      'Content-Length': size,
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
    });
    
    const stream = createReadStream(filePath);
    return new StreamableFile(stream);
  }

  async getMediaInfo(mediaId: string, userId: string): Promise<any> {
    this.logger.debug(
      `Medieninfo-Anfrage für Medium ${mediaId} von Benutzer ${userId}`,
      'StreamingService'
    );
    
    // Finde das Medium
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
      relations: ['library'],
    });
    
    if (!media) {
      throw new NotFoundException(`Medium ${mediaId} nicht gefunden`);
    }
    
    // Hole den Fortschritt des Benutzers für dieses Medium
    let progress = null;
    try {
      progress = await this.progressService.getProgress(userId, mediaId);
    } catch (error) {
      // Kein Fortschritt gefunden, das ist in Ordnung
    }
    
    // Erstelle die Medieninfo
    const mediaInfo = {
      id: media.id,
      title: media.title,
      type: media.type,
      duration: media.duration,
      format: media.format,
      resolution: media.resolution,
      codec: media.codec,
      audioCodec: media.audioCodec,
      audioChannels: media.audioChannels,
      thumbnailPath: media.thumbnailPath ? `/api/media/${media.id}/thumbnail` : null,
      streamUrl: `/api/streaming/${media.id}`,
      progress: progress ? {
        position: progress.position,
        duration: progress.duration,
        completed: progress.completed,
        lastPlayedAt: progress.lastPlayedAt,
      } : null,
    };
    
    return mediaInfo;
  }

  private getMimeType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    
    const mimeTypes = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.flac': 'audio/flac',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac',
      '.mkv': 'video/x-matroska',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  async getSubtitles(mediaId: string, userId: string): Promise<any[]> {
    this.logger.debug(
      `Untertitel-Anfrage für Medium ${mediaId} von Benutzer ${userId}`,
      'StreamingService'
    );
    
    // Finde das Medium
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
      relations: ['library'],
    });
    
    if (!media) {
      throw new NotFoundException(`Medium ${mediaId} nicht gefunden`);
    }
    
    const filePath = media.path;
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Suche nach Untertiteldateien im selben Verzeichnis
    const subtitles = [];
    
    try {
      const files = await fs.promises.readdir(fileDir);
      
      for (const file of files) {
        // Suche nach Dateien mit dem gleichen Namen und Untertitel-Erweiterungen
        if (file.startsWith(fileName) && this.isSubtitleFile(file)) {
          const language = this.extractLanguageFromSubtitleFile(file);
          
          subtitles.push({
            language,
            label: this.getLanguageLabel(language),
            url: `/api/streaming/${mediaId}/subtitles/${encodeURIComponent(file)}`,
            path: path.join(fileDir, file),
          });
        }
      }
    } catch (error) {
      this.logger.error(
        `Fehler beim Suchen nach Untertiteln: ${error.message}`,
        error.stack,
        'StreamingService'
      );
    }
    
    return subtitles;
  }

  async getSubtitleFile(mediaId: string, subtitleFileName: string, userId: string, response: Response): Promise<StreamableFile> {
    this.logger.debug(
      `Untertiteldatei-Anfrage für Medium ${mediaId}, Datei ${subtitleFileName} von Benutzer ${userId}`,
      'StreamingService'
    );
    
    // Finde das Medium
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
      relations: ['library'],
    });
    
    if (!media) {
      throw new NotFoundException(`Medium ${mediaId} nicht gefunden`);
    }
    
    const filePath = media.path;
    const fileDir = path.dirname(filePath);
    const subtitlePath = path.join(fileDir, subtitleFileName);
    
    // Prüfe, ob die Untertiteldatei existiert
    try {
      await statAsync(subtitlePath);
    } catch (error) {
      throw new NotFoundException(`Untertiteldatei nicht gefunden: ${subtitleFileName}`);
    }
    
    // Prüfe, ob es sich um eine Untertiteldatei handelt
    if (!this.isSubtitleFile(subtitlePath)) {
      throw new ForbiddenException('Die angeforderte Datei ist keine Untertiteldatei');
    }
    
    // Setze den MIME-Typ basierend auf der Dateierweiterung
    const mimeType = this.getSubtitleMimeType(subtitlePath);
    response.set({
      'Content-Type': mimeType,
    });
    
    // Streame die Untertiteldatei
    const stream = createReadStream(subtitlePath);
    return new StreamableFile(stream);
  }

  private isSubtitleFile(filePath: string): boolean {
    const extension = path.extname(filePath).toLowerCase();
    return ['.srt', '.vtt', '.ass', '.ssa', '.sub'].includes(extension);
  }

  private getSubtitleMimeType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    
    const mimeTypes = {
      '.srt': 'text/plain',
      '.vtt': 'text/vtt',
      '.ass': 'text/plain',
      '.ssa': 'text/plain',
      '.sub': 'text/plain',
    };
    
    return mimeTypes[extension] || 'text/plain';
  }

  private extractLanguageFromSubtitleFile(fileName: string): string {
    // Versuche, die Sprache aus dem Dateinamen zu extrahieren
    // Typische Formate: movie.en.srt, movie.eng.srt, movie.english.srt
    const parts = fileName.split('.');
    
    if (parts.length >= 3) {
      const possibleLanguage = parts[parts.length - 2].toLowerCase();
      
      // Prüfe auf bekannte Sprachcodes
      const languageCodes = {
        'en': 'en', 'eng': 'en', 'english': 'en',
        'de': 'de', 'ger': 'de', 'german': 'de', 'deutsch': 'de',
        'fr': 'fr', 'fre': 'fr', 'french': 'fr', 'français': 'fr',
        'es': 'es', 'spa': 'es', 'spanish': 'es', 'español': 'es',
        'it': 'it', 'ita': 'it', 'italian': 'it', 'italiano': 'it',
      };
      
      if (languageCodes[possibleLanguage]) {
        return languageCodes[possibleLanguage];
      }
    }
    
    // Fallback: Unbekannte Sprache
    return 'unknown';
  }

  private getLanguageLabel(languageCode: string): string {
    const languageLabels = {
      'en': 'Englisch',
      'de': 'Deutsch',
      'fr': 'Französisch',
      'es': 'Spanisch',
      'it': 'Italienisch',
      'unknown': 'Unbekannt',
    };
    
    return languageLabels[languageCode] || languageCode;
  }
} 