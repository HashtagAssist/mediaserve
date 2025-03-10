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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const media_entity_1 = require("./entities/media.entity");
const metadata_service_1 = require("../metadata/metadata.service");
const logger_service_1 = require("../shared/services/logger.service");
let MediaService = class MediaService {
    constructor(mediaRepository, metadataService, logger) {
        this.mediaRepository = mediaRepository;
        this.metadataService = metadataService;
        this.logger = logger;
    }
    async create(createMediaDto) {
        this.logger.debug(`Erstelle neues Medium: ${createMediaDto.title}`, 'MediaService');
        try {
            const media = this.mediaRepository.create(createMediaDto);
            const savedMedia = await this.mediaRepository.save(media);
            try {
                await this.metadataService.extractMetadata(savedMedia.id);
            }
            catch (error) {
                this.logger.error(`Fehler bei der Metadatenextraktion für Medium ${savedMedia.id}`, error.stack, 'MediaService');
            }
            this.logger.debug(`Medium erfolgreich erstellt: ${savedMedia.id}`, 'MediaService');
            return savedMedia;
        }
        catch (error) {
            this.logger.error(`Fehler beim Erstellen des Mediums: ${error.message}`, error.stack, 'MediaService');
            throw new common_1.InternalServerErrorException(`Fehler beim Erstellen des Mediums: ${error.message}`);
        }
    }
    async findAll(type) {
        this.logger.debug(`Suche alle Medien${type ? ` vom Typ ${type}` : ''}`, 'MediaService');
        try {
            const media = type
                ? await this.mediaRepository.find({ where: { type } })
                : await this.mediaRepository.find();
            this.logger.debug(`${media.length} Medien gefunden`, 'MediaService');
            return media;
        }
        catch (error) {
            this.logger.error(`Fehler beim Abrufen der Medien: ${error.message}`, error.stack, 'MediaService');
            throw new common_1.InternalServerErrorException(`Datenbankfehler: ${error.message}`);
        }
    }
    async findOne(id) {
        this.logger.debug(`Suche Medium mit ID: ${id}`, 'MediaService');
        const media = await this.mediaRepository.findOne({ where: { id } });
        if (!media) {
            this.logger.warn(`Medium mit ID ${id} nicht gefunden`, 'MediaService');
            throw new common_1.NotFoundException(`Medium mit ID ${id} nicht gefunden`);
        }
        return media;
    }
    async update(id, updateMediaDto) {
        this.logger.debug(`Aktualisiere Medium ${id}`, 'MediaService');
        try {
            const media = await this.findOne(id);
            Object.assign(media, updateMediaDto);
            const updatedMedia = await this.mediaRepository.save(media);
            this.logger.debug(`Medium ${id} erfolgreich aktualisiert`, 'MediaService');
            return updatedMedia;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Fehler beim Aktualisieren des Mediums ${id}: ${error.message}`, error.stack, 'MediaService');
            throw new common_1.InternalServerErrorException(`Datenbankfehler: ${error.message}`);
        }
    }
    async remove(id) {
        this.logger.debug(`Lösche Medium ${id}`, 'MediaService');
        try {
            const result = await this.mediaRepository.delete(id);
            if (result.affected === 0) {
                this.logger.warn(`Medium mit ID ${id} nicht gefunden`, 'MediaService');
                throw new common_1.NotFoundException(`Medium mit ID ${id} nicht gefunden`);
            }
            this.logger.debug(`Medium ${id} erfolgreich gelöscht`, 'MediaService');
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Fehler beim Löschen des Mediums ${id}: ${error.message}`, error.stack, 'MediaService');
            throw new common_1.InternalServerErrorException(`Datenbankfehler: ${error.message}`);
        }
    }
    async search(query) {
        this.logger.debug(`Suche Medien mit Query: ${query}`, 'MediaService');
        try {
            const media = await this.mediaRepository.find({
                where: [
                    { title: (0, typeorm_2.Like)(`%${query}%`) },
                    { description: (0, typeorm_2.Like)(`%${query}%`) },
                ],
            });
            this.logger.debug(`${media.length} Medien gefunden für Query: ${query}`, 'MediaService');
            return media;
        }
        catch (error) {
            this.logger.error(`Fehler bei der Mediensuche: ${error.message}`, error.stack, 'MediaService');
            throw new common_1.InternalServerErrorException(`Datenbankfehler: ${error.message}`);
        }
    }
    async findByGenre(genre) {
        this.logger.debug(`Suche Medien nach Genre: ${genre}`, 'MediaService');
        try {
            const media = await this.mediaRepository
                .createQueryBuilder('media')
                .where(':genre = ANY(media.genres)', { genre })
                .getMany();
            this.logger.debug(`${media.length} Medien gefunden für Genre: ${genre}`, 'MediaService');
            return media;
        }
        catch (error) {
            this.logger.error(`Fehler bei der Genre-Suche: ${error.message}`, error.stack, 'MediaService');
            throw new common_1.InternalServerErrorException(`Datenbankfehler: ${error.message}`);
        }
    }
    async findByYear(year) {
        this.logger.debug(`Suche Medien aus dem Jahr ${year}`, 'MediaService');
        return this.mediaRepository.find({
            where: { releaseYear: year },
        });
    }
    async markAsProcessed(id) {
        this.logger.debug(`Markiere Medium ${id} als verarbeitet`, 'MediaService');
        try {
            const media = await this.findOne(id);
            media.processed = true;
            const updatedMedia = await this.mediaRepository.save(media);
            this.logger.debug(`Medium ${id} erfolgreich als verarbeitet markiert`, 'MediaService');
            return updatedMedia;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Fehler beim Markieren des Mediums als verarbeitet: ${error.message}`, error.stack, 'MediaService');
            throw new common_1.InternalServerErrorException(`Datenbankfehler: ${error.message}`);
        }
    }
    async importDirectory(directoryPath) {
        this.logger.debug(`Importiere Medien aus Verzeichnis: ${directoryPath}`, 'MediaService');
        try {
            const mediaFiles = await this.metadataService.analyzeDirectory(directoryPath);
            const createdMedia = [];
            for (const file of mediaFiles) {
                try {
                    const media = await this.create({
                        title: file.title,
                        path: file.path,
                        type: file.type,
                    });
                    createdMedia.push(media);
                    this.logger.debug(`Medium erfolgreich importiert: ${file.path}`, 'MediaService');
                }
                catch (error) {
                    this.logger.error(`Fehler beim Importieren von ${file.path}: ${error.message}`, error.stack, 'MediaService');
                }
            }
            this.logger.debug(`Import abgeschlossen. ${createdMedia.length} von ${mediaFiles.length} Medien erfolgreich importiert`, 'MediaService');
            return createdMedia;
        }
        catch (error) {
            this.logger.error(`Fehler beim Verzeichnisimport: ${error.message}`, error.stack, 'MediaService');
            throw new common_1.InternalServerErrorException(`Import-Fehler: ${error.message}`);
        }
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        metadata_service_1.MetadataService,
        logger_service_1.LoggerService])
], MediaService);
//# sourceMappingURL=media.service.js.map