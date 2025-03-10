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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const media_service_1 = require("./media.service");
const create_media_dto_1 = require("./dto/create-media.dto");
const update_media_dto_1 = require("./dto/update-media.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const media_type_enum_1 = require("./enums/media-type.enum");
const logger_service_1 = require("../shared/services/logger.service");
const swagger_1 = require("@nestjs/swagger");
const media_entity_1 = require("./entities/media.entity");
let MediaController = class MediaController {
    constructor(mediaService, logger) {
        this.mediaService = mediaService;
        this.logger = logger;
    }
    async create(createMediaDto) {
        this.logger.debug(`Erstelle neues Medium: ${createMediaDto.title}`, 'MediaController');
        try {
            const media = await this.mediaService.create(createMediaDto);
            this.logger.debug(`Medium erfolgreich erstellt: ${media.id}`, 'MediaController');
            return media;
        }
        catch (error) {
            this.logger.error(`Fehler beim Erstellen des Mediums: ${error.message}`, error.stack, 'MediaController');
            throw new common_1.InternalServerErrorException('Fehler beim Erstellen des Mediums');
        }
    }
    async findAll(type) {
        this.logger.debug(`Suche alle Medien${type ? ` vom Typ ${type}` : ''}`, 'MediaController');
        try {
            const media = await this.mediaService.findAll(type);
            this.logger.debug(`${media.length} Medien gefunden`, 'MediaController');
            return media;
        }
        catch (error) {
            this.logger.error(`Fehler beim Abrufen der Medien: ${error.message}`, error.stack, 'MediaController');
            throw new common_1.InternalServerErrorException('Fehler beim Abrufen der Medien');
        }
    }
    async search(query) {
        this.logger.debug(`Suche Medien mit Query: ${query}`, 'MediaController');
        try {
            const media = await this.mediaService.search(query);
            this.logger.debug(`${media.length} Medien für Suche gefunden`, 'MediaController');
            return media;
        }
        catch (error) {
            this.logger.error(`Fehler bei der Mediensuche: ${error.message}`, error.stack, 'MediaController');
            throw new common_1.InternalServerErrorException('Fehler bei der Mediensuche');
        }
    }
    async findByGenre(genre) {
        this.logger.debug(`Suche Medien nach Genre: ${genre}`, 'MediaController');
        try {
            const media = await this.mediaService.findByGenre(genre);
            this.logger.debug(`${media.length} Medien im Genre gefunden`, 'MediaController');
            return media;
        }
        catch (error) {
            this.logger.error(`Fehler bei der Genre-Suche: ${error.message}`, error.stack, 'MediaController');
            throw new common_1.InternalServerErrorException('Fehler bei der Genre-Suche');
        }
    }
    async findByYear(year) {
        this.logger.debug(`Suche Medien nach Jahr: ${year}`, 'MediaController');
        try {
            const media = await this.mediaService.findByYear(year);
            this.logger.debug(`${media.length} Medien im Jahr gefunden`, 'MediaController');
            return media;
        }
        catch (error) {
            this.logger.error(`Fehler bei der Jahressuche: ${error.message}`, error.stack, 'MediaController');
            throw new common_1.InternalServerErrorException('Fehler bei der Jahressuche');
        }
    }
    async findOne(id) {
        this.logger.debug(`Suche Medium mit ID: ${id}`, 'MediaController');
        try {
            const media = await this.mediaService.findOne(id);
            this.logger.debug(`Medium ${id} gefunden`, 'MediaController');
            return media;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                this.logger.warn(`Medium ${id} nicht gefunden`, 'MediaController');
                throw error;
            }
            this.logger.error(`Fehler beim Abrufen des Mediums ${id}: ${error.message}`, error.stack, 'MediaController');
            throw new common_1.InternalServerErrorException('Fehler beim Abrufen des Mediums');
        }
    }
    async update(id, updateMediaDto) {
        this.logger.debug(`Aktualisiere Medium ${id}`, 'MediaController');
        try {
            const media = await this.mediaService.update(id, updateMediaDto);
            this.logger.debug(`Medium ${id} aktualisiert`, 'MediaController');
            return media;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                this.logger.warn(`Medium ${id} nicht gefunden`, 'MediaController');
                throw error;
            }
            this.logger.error(`Fehler beim Aktualisieren des Mediums ${id}: ${error.message}`, error.stack, 'MediaController');
            throw new common_1.InternalServerErrorException('Fehler beim Aktualisieren des Mediums');
        }
    }
    async remove(id) {
        this.logger.debug(`Lösche Medium ${id}`, 'MediaController');
        try {
            await this.mediaService.remove(id);
            this.logger.debug(`Medium ${id} gelöscht`, 'MediaController');
            return { message: 'Medium erfolgreich gelöscht' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                this.logger.warn(`Medium ${id} nicht gefunden`, 'MediaController');
                throw error;
            }
            this.logger.error(`Fehler beim Löschen des Mediums ${id}: ${error.message}`, error.stack, 'MediaController');
            throw new common_1.InternalServerErrorException('Fehler beim Löschen des Mediums');
        }
    }
    async markAsProcessed(id) {
        this.logger.debug(`Markiere Medium ${id} als verarbeitet`, 'MediaController');
        try {
            const media = await this.mediaService.markAsProcessed(id);
            this.logger.debug(`Medium ${id} erfolgreich als verarbeitet markiert`, 'MediaController');
            return media;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                this.logger.warn(`Medium ${id} nicht gefunden`, 'MediaController');
                throw error;
            }
            this.logger.error(`Fehler beim Markieren des Mediums ${id} als verarbeitet: ${error.message}`, error.stack, 'MediaController');
            throw new common_1.InternalServerErrorException('Fehler beim Markieren des Mediums als verarbeitet');
        }
    }
    async importDirectory(directoryPath) {
        this.logger.debug(`Importiere Medien aus Verzeichnis: ${directoryPath}`, 'MediaController');
        try {
            const media = await this.mediaService.importDirectory(directoryPath);
            this.logger.debug(`${media.length} Medien importiert`, 'MediaController');
            return media;
        }
        catch (error) {
            this.logger.error(`Fehler beim Importieren aus Verzeichnis ${directoryPath}: ${error.message}`, error.stack, 'MediaController');
            throw new common_1.InternalServerErrorException('Fehler beim Importieren der Medien');
        }
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_media_dto_1.CreateMediaDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Alle Medien abrufen', description: 'Ruft eine Liste aller Medien ab, optional nach Typ gefiltert.' }),
    (0, swagger_1.ApiQuery)({ name: 'type', enum: media_type_enum_1.MediaType, required: false, description: 'Filter nach Medientyp' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste von Medien',
        type: [media_entity_1.Media],
        schema: {
            example: [
                {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    title: 'Beispielvideo',
                    path: '/pfad/zum/video.mp4',
                    type: 'movie',
                    duration: 7200,
                    processed: true,
                    createdAt: '2025-03-10T12:00:00Z'
                }
            ]
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Serverfehler' }),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('genre/:genre'),
    __param(0, (0, common_1.Param)('genre')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "findByGenre", null);
__decorate([
    (0, common_1.Get)('year/:year'),
    __param(0, (0, common_1.Param)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "findByYear", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_media_dto_1.UpdateMediaDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/process'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "markAsProcessed", null);
__decorate([
    (0, common_1.Post)('import-directory'),
    __param(0, (0, common_1.Body)('path')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "importDirectory", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('Medien'),
    (0, common_1.Controller)('media'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [media_service_1.MediaService,
        logger_service_1.LoggerService])
], MediaController);
//# sourceMappingURL=media.controller.js.map