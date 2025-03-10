import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Library } from './entities/library.entity';
import { Media } from '../media/entities/media.entity';
import { MetadataService } from '../metadata/metadata.service';
import { LoggerService } from '../shared/services/logger.service';
import * as path from 'path';
import * as fs from 'fs/promises';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { ThumbnailService } from '../thumbnail/thumbnail.service';
import { CategoryService } from '../category/category.service';
import { FileChangeService } from '../file-change/file-change.service';
import { MediaType } from '../media/enums/media-type.enum';

interface LibraryStats {
  totalFiles: number;
  processedFiles: number;
  byType: {
    movie: number;
    music: number;
  };
  totalSize: number;
  lastScanned: Date | null;
}

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(Library)
    private libraryRepository: Repository<Library>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    private metadataService: MetadataService,
    private logger: LoggerService,
    private thumbnailService: ThumbnailService,
    private categoryService: CategoryService,
    private fileChangeService: FileChangeService,
  ) {}

  async create(createLibraryDto: CreateLibraryDto) {
    const exists = await fs.access(createLibraryDto.path).then(() => true).catch(() => false);
    if (!exists) {
      throw new NotFoundException(`Verzeichnis ${createLibraryDto.path} existiert nicht`);
    }

    const library = this.libraryRepository.create(createLibraryDto);
    await this.libraryRepository.save(library);
    
    // Starte initiales Scanning
    await this.scanLibrary(library.id);
    
    return library;
  }

  async scanLibrary(id: string, options?: { recursive?: boolean; maxDepth?: number; incrementalScan?: boolean }) {
    const library = await this.libraryRepository.findOne({ where: { id } });
    if (!library) {
      throw new NotFoundException(`Bibliothek ${id} nicht gefunden`);
    }

    this.logger.debug(
      `Starte Scan der Bibliothek: ${library.name} ${options?.recursive ? '(rekursiv)' : ''} ${options?.incrementalScan ? '(inkrementell)' : ''}`,
      'LibraryService'
    );

    try {
      // Wenn inkrementeller Scan aktiviert ist, verwende Änderungserkennung
      if (options?.incrementalScan) {
        await this.performIncrementalScan(library, options);
      } else {
        await this.performFullScan(library, options);
      }

      library.lastScanned = new Date();
      await this.libraryRepository.save(library);

      this.logger.debug(
        `Bibliotheksscan abgeschlossen`,
        'LibraryService'
      );
    } catch (error) {
      this.logger.error(
        `Fehler beim Scannen der Bibliothek: ${error.message}`,
        error.stack,
        'LibraryService'
      );
      throw new InternalServerErrorException('Fehler beim Scannen der Bibliothek');
    }
  }

  private async performFullScan(library: Library, options?: { recursive?: boolean; maxDepth?: number }) {
    const mediaFiles = await this.metadataService.analyzeDirectory(library.path, {
      recursive: options?.recursive !== false,
      maxDepth: options?.maxDepth || 10,
    });
    
    const newMediaIds = [];
    
    for (const file of mediaFiles) {
      const relativePath = path.relative(library.path, file.path);
      
      // Prüfe ob Medium bereits existiert
      const existingMedia = await this.mediaRepository.findOne({
        where: {
          library: { id: library.id },
          relativePath,
        }
      });

      if (!existingMedia) {
        const media = this.mediaRepository.create({
          ...file,
          library,
          relativePath,
          type: file.type === MediaType.MUSIC ? MediaType.MUSIC : MediaType.MOVIE,
          processed: false,
        });
        const savedMedia = await this.mediaRepository.save(media);
        const mediaEntity = Array.isArray(savedMedia) ? savedMedia[0] : savedMedia;
        
        // Extrahiere Metadaten
        if ('id' in mediaEntity) {
          await this.metadataService.extractMetadata(mediaEntity.id);
        }
        
        // Berechne Hash für spätere Änderungserkennung
        await this.fileChangeService.updateFileHash(mediaEntity.id);
        
        // Speichere die ID für spätere Verarbeitung
        newMediaIds.push(mediaEntity.id);
      }
    }

    // Starte Thumbnail-Generierung und Kategorisierung für neue Medien
    if (newMediaIds.length > 0) {
      this.processNewMedia(newMediaIds);
    }
  }

  private async performIncrementalScan(library: Library, options?: { recursive?: boolean; maxDepth?: number }) {
    // Erkenne Änderungen im Dateisystem
    const changes = await this.fileChangeService.detectChanges(library.id, library.path);
    
    // Verarbeite neue Dateien
    const newMediaIds = [];
    for (const filePath of changes.added) {
      const relativePath = path.relative(library.path, filePath);
      const fileExt = path.extname(filePath).toLowerCase().slice(1);
      
      // Bestimme Medientyp
      const type = ['.mp3', '.wav', '.flac', '.m4a'].includes(path.extname(filePath).toLowerCase()) 
        ? MediaType.MUSIC 
        : MediaType.MOVIE;
      
      const media = this.mediaRepository.create({
        path: filePath,
        relativePath,
        title: path.basename(filePath, path.extname(filePath)),
        type,
        library,
        processed: false,
      });
      
      const savedMedia = await this.mediaRepository.save(media);
      const mediaEntity = Array.isArray(savedMedia) ? savedMedia[0] : savedMedia;
      
      // Extrahiere Metadaten
      if ('id' in mediaEntity) {
        await this.metadataService.extractMetadata(mediaEntity.id);
      }
      
      // Berechne Hash für spätere Änderungserkennung
      await this.fileChangeService.updateFileHash(mediaEntity.id);
      
      newMediaIds.push(mediaEntity.id);
    }
    
    // Verarbeite geänderte Dateien
    for (const filePath of changes.modified) {
      const relativePath = path.relative(library.path, filePath);
      
      const media = await this.mediaRepository.findOne({
        where: {
          library: { id: library.id },
          relativePath,
        }
      });
      
      if (media) {
        // Aktualisiere Metadaten
        await this.metadataService.extractMetadata(media.id);
        
        // Aktualisiere Hash
        await this.fileChangeService.updateFileHash(media.id);
        
        // Wenn es ein Video ist, Thumbnail neu generieren
        if (media.type === MediaType.MOVIE) {
          await this.thumbnailService.generateThumbnail(media.id);
        }
        
        // Kategorisierung aktualisieren
        await this.categoryService.categorizeMedia(media.id);
      }
    }
    
    // Verarbeite gelöschte Dateien
    for (const filePath of changes.deleted) {
      const relativePath = path.relative(library.path, filePath);
      
      const media = await this.mediaRepository.findOne({
        where: {
          library: { id: library.id },
          relativePath,
        }
      });
      
      if (media) {
        // Lösche Medium aus der Datenbank
        await this.mediaRepository.remove(media);
        
        // Lösche Thumbnail, falls vorhanden
        if (media.thumbnailPath) {
          try {
            await fs.unlink(media.thumbnailPath);
          } catch (error) {
            this.logger.error(
              `Fehler beim Löschen des Thumbnails: ${error.message}`,
              error.stack,
              'LibraryService'
            );
          }
        }
      }
    }
    
    // Starte Thumbnail-Generierung und Kategorisierung für neue Medien
    if (newMediaIds.length > 0) {
      this.processNewMedia(newMediaIds);
    }
    
    this.logger.debug(
      `Inkrementeller Scan abgeschlossen: ${changes.added.length} neue, ${changes.modified.length} geänderte, ${changes.deleted.length} gelöschte Dateien`,
      'LibraryService'
    );
  }
  
  private processNewMedia(mediaIds: string[]) {
    const videoIds = [];
    
    // Filtere Video-IDs
    Promise.all(
      mediaIds.map(async id => {
        const media = await this.mediaRepository.findOne({ where: { id } });
        if (media && media.type === MediaType.MOVIE) {
          videoIds.push(id);
        }
        return media;
      })
    ).then(() => {
      // Starte Thumbnail-Generierung für neue Videos
      if (videoIds.length > 0) {
        this.logger.debug(
          `Starte Thumbnail-Generierung für ${videoIds.length} neue Videos`,
          'LibraryService'
        );
        
        Promise.all(videoIds.map(id => this.thumbnailService.generateThumbnail(id)))
          .catch(error => {
            this.logger.error(
              `Fehler bei der Batch-Thumbnail-Generierung: ${error.message}`,
              error.stack,
              'LibraryService'
            );
          });
      }
      
      // Starte Kategorisierung für alle neuen Medien
      this.logger.debug(
        `Starte Kategorisierung für ${mediaIds.length} neue Medien`,
        'LibraryService'
      );
      
      Promise.all(mediaIds.map(id => this.categoryService.categorizeMedia(id)))
        .catch(error => {
          this.logger.error(
            `Fehler bei der Batch-Kategorisierung: ${error.message}`,
            error.stack,
            'LibraryService'
          );
        });
    });
  }

  async findAll() {
    return this.libraryRepository.find();
  }

  async findOne(id: string) {
    const library = await this.libraryRepository.findOne({ 
      where: { id },
      relations: ['media'],
    });
    
    if (!library) {
      throw new NotFoundException(`Bibliothek ${id} nicht gefunden`);
    }
    
    return library;
  }

  async remove(id: string) {
    const result = await this.libraryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Bibliothek ${id} nicht gefunden`);
    }
  }

  async update(id: string, updateLibraryDto: UpdateLibraryDto) {
    const library = await this.findOne(id);
    
    if (updateLibraryDto.path) {
      const exists = await fs.access(updateLibraryDto.path).then(() => true).catch(() => false);
      if (!exists) {
        throw new NotFoundException(`Verzeichnis ${updateLibraryDto.path} existiert nicht`);
      }
    }

    Object.assign(library, updateLibraryDto);
    return await this.libraryRepository.save(library);
  }

  async getStats(id: string): Promise<LibraryStats> {
    const library = await this.libraryRepository.findOne({
      where: { id },
      relations: ['media'],
    });

    if (!library) {
      throw new NotFoundException(`Bibliothek ${id} nicht gefunden`);
    }

    this.logger.debug(`Berechne Statistiken für Bibliothek: ${library.name}`, 'LibraryService');

    const stats: LibraryStats = {
      totalFiles: library.media.length,
      processedFiles: library.media.filter(m => m.processed).length,
      byType: {
        movie: library.media.filter(m => m.type === MediaType.MOVIE).length,
        music: library.media.filter(m => m.type === MediaType.MUSIC).length,
      },
      totalSize: library.media.reduce((acc, m) => acc + (m.fileSize || 0), 0),
      lastScanned: library.lastScanned,
    };

    return stats;
  }
} 