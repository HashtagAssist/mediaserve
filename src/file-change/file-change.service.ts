import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../media/entities/media.entity';
import { LoggerService } from '../shared/services/logger.service';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { FileChange } from './entities/file-change.entity';
import { Library } from '../library/entities/library.entity';

interface FileChangeResult {
  added: string[];
  modified: string[];
  deleted: string[];
}

@Injectable()
export class FileChangeService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(FileChange)
    private fileChangeRepository: Repository<FileChange>,
    @InjectRepository(Library)
    private libraryRepository: Repository<Library>,
    private logger: LoggerService,
  ) {}

  async detectChanges(libraryId: string, directoryPath: string): Promise<FileChangeResult> {
    this.logger.debug(`Starte Änderungserkennung für Bibliothek ${libraryId}`, 'FileChangeService');
    
    // Lade alle Medien dieser Bibliothek aus der Datenbank
    const existingMedia = await this.mediaRepository.find({
      where: { library: { id: libraryId } },
    });
    
    // Erstelle eine Map für schnelleren Zugriff
    const mediaMap = new Map<string, Media>();
    for (const media of existingMedia) {
      const fullPath = path.join(directoryPath, media.relativePath);
      mediaMap.set(fullPath, media);
    }
    
    // Finde alle Mediendateien im Verzeichnis
    const currentFiles = await this.scanDirectory(directoryPath);
    
    // Identifiziere hinzugefügte, geänderte und gelöschte Dateien
    const result: FileChangeResult = {
      added: [],
      modified: [],
      deleted: [],
    };
    
    // Prüfe auf neue und geänderte Dateien
    for (const filePath of currentFiles) {
      if (!mediaMap.has(filePath)) {
        // Neue Datei
        result.added.push(filePath);
      } else {
        // Existierende Datei - prüfe auf Änderungen
        const media = mediaMap.get(filePath);
        const isModified = await this.isFileModified(filePath, media);
        
        if (isModified) {
          result.modified.push(filePath);
        }
        
        // Entferne die Datei aus der Map, um später gelöschte Dateien zu identifizieren
        mediaMap.delete(filePath);
      }
    }
    
    // Alle verbleibenden Dateien in der Map wurden gelöscht
    for (const [filePath] of mediaMap.entries()) {
      result.deleted.push(filePath);
    }
    
    this.logger.debug(
      `Änderungserkennung abgeschlossen: ${result.added.length} neue, ${result.modified.length} geänderte, ${result.deleted.length} gelöschte Dateien`,
      'FileChangeService'
    );
    
    return result;
  }
  
  private async scanDirectory(dirPath: string, files: string[] = []): Promise<string[]> {
    const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Rekursiv Unterordner durchsuchen
        await this.scanDirectory(fullPath, files);
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  private async isFileModified(filePath: string, media: Media): Promise<boolean> {
    try {
      const stats = await fsPromises.stat(filePath);
      
      // Prüfe Dateigröße
      if (media.fileSize && stats.size !== media.fileSize) {
        return true;
      }
      
      // Prüfe Änderungsdatum
      const mtime = stats.mtime.getTime();
      const lastScanned = media.updatedAt.getTime();
      
      if (mtime > lastScanned) {
        // Datei wurde nach dem letzten Scan geändert
        
        // Optional: Berechne Hash für genauere Erkennung
        if (media.fileHash) {
          const currentHash = await this.calculateFileHash(filePath);
          return currentHash !== media.fileHash;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(
        `Fehler beim Prüfen der Dateiänderung: ${error.message}`,
        error.stack,
        'FileChangeService'
      );
      return false;
    }
  }
  
  private async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);
      
      stream.on('error', err => reject(err));
      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
    });
  }
  
  async updateFileHash(mediaId: string): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id: mediaId } });
    if (!media) {
      return;
    }
    
    try {
      const filePath = media.path;
      const hash = await this.calculateFileHash(filePath);
      
      media.fileHash = hash;
      await this.mediaRepository.save(media);
      
      this.logger.debug(`Hash aktualisiert für Medium ${mediaId}: ${hash}`, 'FileChangeService');
    } catch (error) {
      this.logger.error(
        `Fehler beim Aktualisieren des Datei-Hashs: ${error.message}`,
        error.stack,
        'FileChangeService'
      );
    }
  }

  async findAll(
    limit: number = 20,
    offset: number = 0,
    type?: string,
    status?: string,
  ): Promise<{ total: number; items: FileChange[] }> {
    this.logger.debug(
      `Rufe Dateiänderungen ab: limit=${limit}, offset=${offset}, type=${type}, status=${status}`,
      'FileChangeService'
    );
    
    const queryBuilder = this.fileChangeRepository.createQueryBuilder('fileChange')
      .leftJoinAndSelect('fileChange.library', 'library')
      .skip(offset)
      .take(limit)
      .orderBy('fileChange.createdAt', 'DESC');
    
    if (type) {
      queryBuilder.andWhere('fileChange.type = :type', { type });
    }
    
    if (status) {
      queryBuilder.andWhere('fileChange.status = :status', { status });
    }
    
    const [items, total] = await queryBuilder.getManyAndCount();
    
    return { total, items };
  }

  async processChanges(libraryId?: string): Promise<{ processed: number; failed: number }> {
    this.logger.debug(
      `Verarbeite Dateiänderungen${libraryId ? ` für Bibliothek ${libraryId}` : ''}`,
      'FileChangeService'
    );
    
    // Prüfe, ob die Bibliothek existiert, falls eine ID angegeben wurde
    if (libraryId) {
      const library = await this.libraryRepository.findOne({
        where: { id: libraryId },
      });
      
      if (!library) {
        this.logger.warn(`Bibliothek ${libraryId} nicht gefunden`, 'FileChangeService');
        throw new NotFoundException(`Bibliothek mit ID ${libraryId} nicht gefunden`);
      }
    }
    
    // Suche nach ausstehenden Änderungen
    const queryBuilder = this.fileChangeRepository.createQueryBuilder('fileChange')
      .where('fileChange.status = :status', { status: 'pending' });
    
    if (libraryId) {
      queryBuilder.andWhere('fileChange.library.id = :libraryId', { libraryId });
    }
    
    const pendingChanges = await queryBuilder.getMany();
    
    let processed = 0;
    let failed = 0;
    
    // Verarbeite die Änderungen
    for (const change of pendingChanges) {
      try {
        // Hier würde die eigentliche Verarbeitung stattfinden
        // z.B. Medien hinzufügen, aktualisieren oder entfernen
        
        // Markiere als verarbeitet
        change.status = 'processed';
        await this.fileChangeRepository.save(change);
        processed++;
      } catch (error) {
        // Markiere als fehlgeschlagen
        change.status = 'failed';
        change.errorMessage = error.message;
        await this.fileChangeRepository.save(change);
        failed++;
        
        this.logger.error(
          `Fehler bei der Verarbeitung von Dateiänderung ${change.id}: ${error.message}`,
          error.stack,
          'FileChangeService'
        );
      }
    }
    
    this.logger.debug(
      `Dateiänderungen verarbeitet: ${processed} erfolgreich, ${failed} fehlgeschlagen`,
      'FileChangeService'
    );
    
    return { processed, failed };
  }
} 