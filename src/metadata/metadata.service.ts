import { Injectable, NotFoundException, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../media/entities/media.entity';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import { LoggerService } from '../shared/services/logger.service';
import { ConfigService } from '@nestjs/config';

const execAsync = promisify(exec);

interface FFProbeStream {
  codec_type: string;
  codec_name: string;
  width?: number;
  height?: number;
  r_frame_rate?: string;
  sample_rate?: string;
  channels?: number;
  bit_rate?: string;
}

interface FFProbeData {
  streams: FFProbeStream[];
  format: {
    filename: string;
    duration: string;
    size: string;
    bit_rate: string;
    format_name: string;
    tags?: Record<string, string>;
  };
}

interface AnalyzeOptions {
  recursive?: boolean;
  maxDepth?: number;
  includeHidden?: boolean;
}

@Injectable()
export class MetadataService implements OnModuleInit {
  private readonly supportedFormats = new Set([
    'mp4', 'mkv', 'avi', 'mov',
    'mp3', 'wav', 'flac', 'm4a'
  ]);
  private ffmpegAvailable: boolean;

  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    private logger: LoggerService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.ffmpegAvailable = this.configService.get<boolean>('FFMPEG_INSTALLED', false);
    if (!this.ffmpegAvailable) {
      this.logger.warn(
        'FFmpeg ist nicht verfügbar. Metadatenextraktion wird eingeschränkt sein.',
        'MetadataService'
      );
    } else {
      this.logger.debug('FFmpeg ist verfügbar und wird für Metadatenextraktion verwendet.', 'MetadataService');
    }
  }

  async extractMetadata(mediaId: string) {
    const media = await this.mediaRepository.findOne({ where: { id: mediaId } });
    if (!media) {
      throw new NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
    }

    if (!this.ffmpegAvailable) {
      this.logger.warn(
        `Metadatenextraktion für Medium ${mediaId} übersprungen - FFmpeg nicht verfügbar`,
        'MetadataService'
      );
      return media;
    }

    try {
      const metadata = await this.getFFmpegMetadata(media.path);
      await this.updateMediaMetadata(media, metadata);
      return media;
    } catch (error) {
      this.logger.error(
        `Fehler beim Extrahieren der Metadaten: ${error.message}`,
        error.stack,
        'MetadataService'
      );
      throw new InternalServerErrorException(`Fehler beim Extrahieren der Metadaten: ${error.message}`);
    }
  }

  private async getFFmpegMetadata(filePath: string): Promise<FFProbeData> {
    try {
      const { stdout } = await execAsync(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`
      );
      return JSON.parse(stdout);
    } catch (error) {
      throw new Error(`FFmpeg Fehler: ${error.message}`);
    }
  }

  private async updateMediaMetadata(media: Media, metadata: FFProbeData) {
    const videoStream = metadata.streams.find(s => s.codec_type === 'video');
    const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

    const duration = parseFloat(metadata.format.duration);
    const fileSize = parseInt(metadata.format.size);
    const format = metadata.format.format_name;

    const updateData: Partial<Media> = {
      duration,
      format,
      fileSize,
      processed: true,
    };

    if (videoStream) {
      updateData.resolution = videoStream.width && videoStream.height
        ? `${videoStream.width}x${videoStream.height}`
        : undefined;
      updateData.codec = videoStream.codec_name;
      updateData.frameRate = videoStream.r_frame_rate;
    }

    if (audioStream) {
      updateData.audioCodec = audioStream.codec_name;
      updateData.audioChannels = audioStream.channels;
      updateData.sampleRate = audioStream.sample_rate;
    }

    // Extrahiere zusätzliche Metadaten aus den Tags
    if (metadata.format.tags) {
      if (!media.title && metadata.format.tags.title) {
        updateData.title = metadata.format.tags.title;
      }
      if (!media.releaseYear && metadata.format.tags.date) {
        updateData.releaseYear = new Date(metadata.format.tags.date).getFullYear();
      }
    }

    Object.assign(media, updateData);
    return await this.mediaRepository.save(media);
  }

  async analyzeDirectory(directoryPath: string, options: AnalyzeOptions = {}) {
    const defaultOptions: AnalyzeOptions = {
      recursive: true,
      maxDepth: 10,
      includeHidden: false,
    };

    const opts = { ...defaultOptions, ...options };
    
    this.logger.debug(
      `Starte Verzeichnisanalyse: ${directoryPath} (rekursiv: ${opts.recursive}, maxDepth: ${opts.maxDepth})`,
      'MetadataService'
    );

    try {
      const mediaFiles = await this.findMediaFiles(directoryPath, opts);
      
      this.logger.debug(
        `Verzeichnisanalyse abgeschlossen. ${mediaFiles.length} Mediendateien gefunden.`,
        'MetadataService'
      );

      return mediaFiles;
    } catch (error) {
      this.logger.error(
        `Fehler beim Analysieren des Verzeichnisses: ${error.message}`,
        error.stack,
        'MetadataService'
      );
      throw new Error(`Fehler beim Analysieren des Verzeichnisses: ${error.message}`);
    }
  }

  private async findMediaFiles(dirPath: string, options: AnalyzeOptions, currentDepth = 0): Promise<any[]> {
    if (currentDepth > (options.maxDepth || 10)) {
      this.logger.debug(`Maximale Tiefe erreicht in: ${dirPath}`, 'MetadataService');
      return [];
    }

    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    let mediaFiles = [];

    for (const entry of entries) {
      // Überspringe versteckte Dateien/Ordner, wenn nicht explizit eingeschlossen
      if (!options.includeHidden && entry.name.startsWith('.')) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory() && options.recursive) {
        // Rekursiv Unterordner durchsuchen
        const subDirFiles = await this.findMediaFiles(fullPath, options, currentDepth + 1);
        mediaFiles = [...mediaFiles, ...subDirFiles];
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase().slice(1);
        
        if (this.supportedFormats.has(ext)) {
          const mediaFile = {
            path: fullPath,
            type: this.getMediaType(fullPath),
            title: path.basename(fullPath, path.extname(fullPath)),
          };

          this.logger.debug(
            `Gefundene Mediendatei: ${fullPath} (Typ: ${mediaFile.type})`,
            'MetadataService'
          );

          mediaFiles.push(mediaFile);
        }
      }
    }

    return mediaFiles;
  }

  private getMediaType(filePath: string): 'movie' | 'music' {
    const ext = path.extname(filePath).toLowerCase();
    return ['.mp3', '.wav', '.flac', '.m4a'].includes(ext) ? 'music' : 'movie';
  }

  async getMediaMetadata(mediaId: string): Promise<any> {
    this.logger.debug(`Rufe Metadaten für Medium ${mediaId} ab`, 'MetadataService');
    
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });
    
    if (!media) {
      this.logger.warn(`Medium ${mediaId} nicht gefunden`, 'MetadataService');
      throw new NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
    }
    
    // Extrahiere die Metadaten aus dem Medium
    const metadata = {
      title: media.title,
      description: media.description,
      releaseYear: media.releaseYear,
      director: media.director,
      actors: media.actors,
      genres: media.genres,
      duration: media.duration,
      language: media.language,
    };
    
    return metadata;
  }

  async fetchMetadata(mediaId: string, source?: string): Promise<any> {
    this.logger.debug(
      `Rufe Metadaten für Medium ${mediaId} von Quelle ${source || 'Standard'} ab`,
      'MetadataService'
    );
    
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });
    
    if (!media) {
      this.logger.warn(`Medium ${mediaId} nicht gefunden`, 'MetadataService');
      throw new NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
    }
    
    // Hier würde die eigentliche Metadaten-Abfrage von externen Quellen stattfinden
    // z.B. TMDb, OMDB, etc.
    
    // Beispiel-Metadaten
    const metadata = {
      title: media.title || 'Unbekannter Titel',
      description: 'Beschreibung aus externer Quelle',
      releaseYear: 2023,
      director: 'Beispiel Regisseur',
      actors: ['Schauspieler 1', 'Schauspieler 2'],
      genres: ['Action', 'Drama'],
      duration: media.duration || 0,
      language: 'de',
    };
    
    return metadata;
  }

  async updateMetadata(mediaId: string, metadataDto: any): Promise<void> {
    this.logger.debug(`Aktualisiere Metadaten für Medium ${mediaId}`, 'MetadataService');
    
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });
    
    if (!media) {
      this.logger.warn(`Medium ${mediaId} nicht gefunden`, 'MetadataService');
      throw new NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
    }
    
    // Aktualisiere die Metadaten des Mediums
    Object.assign(media, metadataDto);
    
    await this.mediaRepository.save(media);
  }
} 