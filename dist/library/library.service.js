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
exports.LibraryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const library_entity_1 = require("./entities/library.entity");
const media_entity_1 = require("../media/entities/media.entity");
const metadata_service_1 = require("../metadata/metadata.service");
const logger_service_1 = require("../shared/services/logger.service");
const path = require("path");
const fs = require("fs/promises");
const thumbnail_service_1 = require("../thumbnail/thumbnail.service");
const category_service_1 = require("../category/category.service");
const file_change_service_1 = require("../file-change/file-change.service");
const media_type_enum_1 = require("../media/enums/media-type.enum");
let LibraryService = class LibraryService {
    constructor(libraryRepository, mediaRepository, metadataService, logger, thumbnailService, categoryService, fileChangeService) {
        this.libraryRepository = libraryRepository;
        this.mediaRepository = mediaRepository;
        this.metadataService = metadataService;
        this.logger = logger;
        this.thumbnailService = thumbnailService;
        this.categoryService = categoryService;
        this.fileChangeService = fileChangeService;
    }
    async create(createLibraryDto) {
        const exists = await fs.access(createLibraryDto.path).then(() => true).catch(() => false);
        if (!exists) {
            throw new common_1.NotFoundException(`Verzeichnis ${createLibraryDto.path} existiert nicht`);
        }
        const library = this.libraryRepository.create(createLibraryDto);
        await this.libraryRepository.save(library);
        await this.scanLibrary(library.id);
        return library;
    }
    async scanLibrary(id, options) {
        const library = await this.libraryRepository.findOne({ where: { id } });
        if (!library) {
            throw new common_1.NotFoundException(`Bibliothek ${id} nicht gefunden`);
        }
        this.logger.debug(`Starte Scan der Bibliothek: ${library.name} ${(options === null || options === void 0 ? void 0 : options.recursive) ? '(rekursiv)' : ''} ${(options === null || options === void 0 ? void 0 : options.incrementalScan) ? '(inkrementell)' : ''}`, 'LibraryService');
        try {
            if (options === null || options === void 0 ? void 0 : options.incrementalScan) {
                await this.performIncrementalScan(library, options);
            }
            else {
                await this.performFullScan(library, options);
            }
            library.lastScanned = new Date();
            await this.libraryRepository.save(library);
            this.logger.debug(`Bibliotheksscan abgeschlossen`, 'LibraryService');
        }
        catch (error) {
            this.logger.error(`Fehler beim Scannen der Bibliothek: ${error.message}`, error.stack, 'LibraryService');
            throw new common_1.InternalServerErrorException('Fehler beim Scannen der Bibliothek');
        }
    }
    async performFullScan(library, options) {
        const mediaFiles = await this.metadataService.analyzeDirectory(library.path, {
            recursive: (options === null || options === void 0 ? void 0 : options.recursive) !== false,
            maxDepth: (options === null || options === void 0 ? void 0 : options.maxDepth) || 10,
        });
        const newMediaIds = [];
        for (const file of mediaFiles) {
            const relativePath = path.relative(library.path, file.path);
            const existingMedia = await this.mediaRepository.findOne({
                where: {
                    library: { id: library.id },
                    relativePath,
                }
            });
            if (!existingMedia) {
                const media = this.mediaRepository.create(Object.assign(Object.assign({}, file), { library,
                    relativePath, type: file.type === media_type_enum_1.MediaType.MUSIC ? media_type_enum_1.MediaType.MUSIC : media_type_enum_1.MediaType.MOVIE, processed: false }));
                const savedMedia = await this.mediaRepository.save(media);
                const mediaEntity = Array.isArray(savedMedia) ? savedMedia[0] : savedMedia;
                if ('id' in mediaEntity) {
                    await this.metadataService.extractMetadata(mediaEntity.id);
                }
                await this.fileChangeService.updateFileHash(mediaEntity.id);
                newMediaIds.push(mediaEntity.id);
            }
        }
        if (newMediaIds.length > 0) {
            this.processNewMedia(newMediaIds);
        }
    }
    async performIncrementalScan(library, options) {
        const changes = await this.fileChangeService.detectChanges(library.id, library.path);
        const newMediaIds = [];
        for (const filePath of changes.added) {
            const relativePath = path.relative(library.path, filePath);
            const fileExt = path.extname(filePath).toLowerCase().slice(1);
            const type = ['.mp3', '.wav', '.flac', '.m4a'].includes(path.extname(filePath).toLowerCase())
                ? media_type_enum_1.MediaType.MUSIC
                : media_type_enum_1.MediaType.MOVIE;
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
            if ('id' in mediaEntity) {
                await this.metadataService.extractMetadata(mediaEntity.id);
            }
            await this.fileChangeService.updateFileHash(mediaEntity.id);
            newMediaIds.push(mediaEntity.id);
        }
        for (const filePath of changes.modified) {
            const relativePath = path.relative(library.path, filePath);
            const media = await this.mediaRepository.findOne({
                where: {
                    library: { id: library.id },
                    relativePath,
                }
            });
            if (media) {
                await this.metadataService.extractMetadata(media.id);
                await this.fileChangeService.updateFileHash(media.id);
                if (media.type === media_type_enum_1.MediaType.MOVIE) {
                    await this.thumbnailService.generateThumbnail(media.id);
                }
                await this.categoryService.categorizeMedia(media.id);
            }
        }
        for (const filePath of changes.deleted) {
            const relativePath = path.relative(library.path, filePath);
            const media = await this.mediaRepository.findOne({
                where: {
                    library: { id: library.id },
                    relativePath,
                }
            });
            if (media) {
                await this.mediaRepository.remove(media);
                if (media.thumbnailPath) {
                    try {
                        await fs.unlink(media.thumbnailPath);
                    }
                    catch (error) {
                        this.logger.error(`Fehler beim Löschen des Thumbnails: ${error.message}`, error.stack, 'LibraryService');
                    }
                }
            }
        }
        if (newMediaIds.length > 0) {
            this.processNewMedia(newMediaIds);
        }
        this.logger.debug(`Inkrementeller Scan abgeschlossen: ${changes.added.length} neue, ${changes.modified.length} geänderte, ${changes.deleted.length} gelöschte Dateien`, 'LibraryService');
    }
    processNewMedia(mediaIds) {
        const videoIds = [];
        Promise.all(mediaIds.map(async (id) => {
            const media = await this.mediaRepository.findOne({ where: { id } });
            if (media && media.type === media_type_enum_1.MediaType.MOVIE) {
                videoIds.push(id);
            }
            return media;
        })).then(() => {
            if (videoIds.length > 0) {
                this.logger.debug(`Starte Thumbnail-Generierung für ${videoIds.length} neue Videos`, 'LibraryService');
                Promise.all(videoIds.map(id => this.thumbnailService.generateThumbnail(id)))
                    .catch(error => {
                    this.logger.error(`Fehler bei der Batch-Thumbnail-Generierung: ${error.message}`, error.stack, 'LibraryService');
                });
            }
            this.logger.debug(`Starte Kategorisierung für ${mediaIds.length} neue Medien`, 'LibraryService');
            Promise.all(mediaIds.map(id => this.categoryService.categorizeMedia(id)))
                .catch(error => {
                this.logger.error(`Fehler bei der Batch-Kategorisierung: ${error.message}`, error.stack, 'LibraryService');
            });
        });
    }
    async findAll() {
        return this.libraryRepository.find();
    }
    async findOne(id) {
        const library = await this.libraryRepository.findOne({
            where: { id },
            relations: ['media'],
        });
        if (!library) {
            throw new common_1.NotFoundException(`Bibliothek ${id} nicht gefunden`);
        }
        return library;
    }
    async remove(id) {
        const result = await this.libraryRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Bibliothek ${id} nicht gefunden`);
        }
    }
    async update(id, updateLibraryDto) {
        const library = await this.findOne(id);
        if (updateLibraryDto.path) {
            const exists = await fs.access(updateLibraryDto.path).then(() => true).catch(() => false);
            if (!exists) {
                throw new common_1.NotFoundException(`Verzeichnis ${updateLibraryDto.path} existiert nicht`);
            }
        }
        Object.assign(library, updateLibraryDto);
        return await this.libraryRepository.save(library);
    }
    async getStats(id) {
        const library = await this.libraryRepository.findOne({
            where: { id },
            relations: ['media'],
        });
        if (!library) {
            throw new common_1.NotFoundException(`Bibliothek ${id} nicht gefunden`);
        }
        this.logger.debug(`Berechne Statistiken für Bibliothek: ${library.name}`, 'LibraryService');
        const stats = {
            totalFiles: library.media.length,
            processedFiles: library.media.filter(m => m.processed).length,
            byType: {
                movie: library.media.filter(m => m.type === media_type_enum_1.MediaType.MOVIE).length,
                music: library.media.filter(m => m.type === media_type_enum_1.MediaType.MUSIC).length,
            },
            totalSize: library.media.reduce((acc, m) => acc + (m.fileSize || 0), 0),
            lastScanned: library.lastScanned,
        };
        return stats;
    }
};
exports.LibraryService = LibraryService;
exports.LibraryService = LibraryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(library_entity_1.Library)),
    __param(1, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        metadata_service_1.MetadataService,
        logger_service_1.LoggerService,
        thumbnail_service_1.ThumbnailService,
        category_service_1.CategoryService,
        file_change_service_1.FileChangeService])
], LibraryService);
//# sourceMappingURL=library.service.js.map