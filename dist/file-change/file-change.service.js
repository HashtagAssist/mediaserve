"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileChangeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const media_entity_1 = require("../media/entities/media.entity");
const logger_service_1 = require("../shared/services/logger.service");
const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const file_change_entity_1 = require("./entities/file-change.entity");
const library_entity_1 = require("../library/entities/library.entity");
let FileChangeService = class FileChangeService {
    constructor(mediaRepository, fileChangeRepository, libraryRepository, logger) {
        this.mediaRepository = mediaRepository;
        this.fileChangeRepository = fileChangeRepository;
        this.libraryRepository = libraryRepository;
        this.logger = logger;
    }
    async detectChanges(libraryId, directoryPath) {
        this.logger.debug(`Starte Änderungserkennung für Bibliothek ${libraryId}`, 'FileChangeService');
        const existingMedia = await this.mediaRepository.find({
            where: { library: { id: libraryId } },
        });
        const mediaMap = new Map();
        for (const media of existingMedia) {
            const fullPath = path.join(directoryPath, media.relativePath);
            mediaMap.set(fullPath, media);
        }
        const currentFiles = await this.scanDirectory(directoryPath);
        const result = {
            added: [],
            modified: [],
            deleted: [],
        };
        for (const filePath of currentFiles) {
            if (!mediaMap.has(filePath)) {
                result.added.push(filePath);
            }
            else {
                const media = mediaMap.get(filePath);
                const isModified = await this.isFileModified(filePath, media);
                if (isModified) {
                    result.modified.push(filePath);
                }
                mediaMap.delete(filePath);
            }
        }
        for (const [filePath] of mediaMap.entries()) {
            result.deleted.push(filePath);
        }
        this.logger.debug(`Änderungserkennung abgeschlossen: ${result.added.length} neue, ${result.modified.length} geänderte, ${result.deleted.length} gelöschte Dateien`, 'FileChangeService');
        return result;
    }
    async scanDirectory(dirPath, files = []) {
        const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                await this.scanDirectory(fullPath, files);
            }
            else {
                files.push(fullPath);
            }
        }
        return files;
    }
    async isFileModified(filePath, media) {
        try {
            const stats = await fsPromises.stat(filePath);
            if (media.fileSize && stats.size !== media.fileSize) {
                return true;
            }
            const mtime = stats.mtime.getTime();
            const lastScanned = media.updatedAt.getTime();
            if (mtime > lastScanned) {
                if (media.fileHash) {
                    const currentHash = await this.calculateFileHash(filePath);
                    return currentHash !== media.fileHash;
                }
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Fehler beim Prüfen der Dateiänderung: ${error.message}`, error.stack, 'FileChangeService');
            return false;
        }
    }
    async calculateFileHash(filePath) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('md5');
            const stream = fs.createReadStream(filePath);
            stream.on('error', err => reject(err));
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
        });
    }
    async updateFileHash(mediaId) {
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
        }
        catch (error) {
            this.logger.error(`Fehler beim Aktualisieren des Datei-Hashs: ${error.message}`, error.stack, 'FileChangeService');
        }
    }
    async findAll(limit = 20, offset = 0, type, status) {
        this.logger.debug(`Rufe Dateiänderungen ab: limit=${limit}, offset=${offset}, type=${type}, status=${status}`, 'FileChangeService');
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
    async processChanges(libraryId) {
        this.logger.debug(`Verarbeite Dateiänderungen${libraryId ? ` für Bibliothek ${libraryId}` : ''}`, 'FileChangeService');
        if (libraryId) {
            const library = await this.libraryRepository.findOne({
                where: { id: libraryId },
            });
            if (!library) {
                this.logger.warn(`Bibliothek ${libraryId} nicht gefunden`, 'FileChangeService');
                throw new common_1.NotFoundException(`Bibliothek mit ID ${libraryId} nicht gefunden`);
            }
        }
        const queryBuilder = this.fileChangeRepository.createQueryBuilder('fileChange')
            .where('fileChange.status = :status', { status: 'pending' });
        if (libraryId) {
            queryBuilder.andWhere('fileChange.library.id = :libraryId', { libraryId });
        }
        const pendingChanges = await queryBuilder.getMany();
        let processed = 0;
        let failed = 0;
        for (const change of pendingChanges) {
            try {
                change.status = 'processed';
                await this.fileChangeRepository.save(change);
                processed++;
            }
            catch (error) {
                change.status = 'failed';
                change.errorMessage = error.message;
                await this.fileChangeRepository.save(change);
                failed++;
                this.logger.error(`Fehler bei der Verarbeitung von Dateiänderung ${change.id}: ${error.message}`, error.stack, 'FileChangeService');
            }
        }
        this.logger.debug(`Dateiänderungen verarbeitet: ${processed} erfolgreich, ${failed} fehlgeschlagen`, 'FileChangeService');
        return { processed, failed };
    }
};
exports.FileChangeService = FileChangeService;
exports.FileChangeService = FileChangeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __param(1, (0, typeorm_1.InjectRepository)(file_change_entity_1.FileChange)),
    __param(2, (0, typeorm_1.InjectRepository)(library_entity_1.Library)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        logger_service_1.LoggerService])
], FileChangeService);
//# sourceMappingURL=file-change.service.js.map