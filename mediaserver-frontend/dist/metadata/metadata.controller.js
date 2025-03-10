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
exports.MetadataController = void 0;
const common_1 = require("@nestjs/common");
const metadata_service_1 = require("./metadata.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const logger_service_1 = require("../shared/services/logger.service");
const swagger_1 = require("@nestjs/swagger");
let MetadataController = class MetadataController {
    constructor(metadataService, logger) {
        this.metadataService = metadataService;
        this.logger = logger;
    }
    async getMediaMetadata(mediaId) {
        this.logger.debug(`Rufe Metadaten für Medium ${mediaId} ab`, 'MetadataController');
        return this.metadataService.getMediaMetadata(mediaId);
    }
    async fetchMetadata(mediaId, source) {
        this.logger.debug(`Rufe Metadaten für Medium ${mediaId} von Quelle ${source || 'Standard'} ab`, 'MetadataController');
        return this.metadataService.fetchMetadata(mediaId, source);
    }
    async updateMetadata(mediaId, metadataDto) {
        this.logger.debug(`Aktualisiere Metadaten für Medium ${mediaId}`, 'MetadataController');
        await this.metadataService.updateMetadata(mediaId, metadataDto);
        return { message: 'Metadaten erfolgreich aktualisiert' };
    }
    async extractMetadata(id) {
        this.logger.debug(`Starte Metadatenextraktion für Medium: ${id}`, 'MetadataController');
        try {
            const media = await this.metadataService.extractMetadata(id);
            this.logger.debug(`Metadatenextraktion für Medium ${id} erfolgreich`, 'MetadataController');
            return media;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                this.logger.warn(`Medium ${id} für Metadatenextraktion nicht gefunden`, 'MetadataController');
                throw error;
            }
            this.logger.error(`Fehler bei der Metadatenextraktion für Medium ${id}: ${error.message}`, error.stack, 'MetadataController');
            throw new common_1.InternalServerErrorException('Fehler bei der Metadatenextraktion');
        }
    }
    async analyzeDirectory(directoryPath) {
        this.logger.debug(`Starte Verzeichnisanalyse: ${directoryPath}`, 'MetadataController');
        try {
            const mediaFiles = await this.metadataService.analyzeDirectory(directoryPath);
            this.logger.debug(`Verzeichnisanalyse abgeschlossen, ${mediaFiles.length} Dateien gefunden`, 'MetadataController');
            return mediaFiles;
        }
        catch (error) {
            this.logger.error(`Fehler bei der Verzeichnisanalyse von ${directoryPath}: ${error.message}`, error.stack, 'MetadataController');
            throw new common_1.InternalServerErrorException('Fehler bei der Verzeichnisanalyse');
        }
    }
};
exports.MetadataController = MetadataController;
__decorate([
    (0, common_1.Get)('media/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Metadaten eines Mediums abrufen' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Metadaten des Mediums',
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Beispielfilm' },
                description: { type: 'string', example: 'Ein Beispielfilm über...' },
                releaseYear: { type: 'number', example: 2023 },
                director: { type: 'string', example: 'Max Mustermann' },
                actors: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Schauspieler 1', 'Schauspieler 2']
                },
                genres: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Action', 'Drama']
                },
                duration: { type: 'number', example: 7200 },
                language: { type: 'string', example: 'de' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medium nicht gefunden' }),
    __param(0, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "getMediaMetadata", null);
__decorate([
    (0, common_1.Post)('media/:mediaId/fetch'),
    (0, swagger_1.ApiOperation)({
        summary: 'Metadaten für ein Medium abrufen',
        description: 'Ruft Metadaten von externen Quellen ab und speichert sie'
    }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'source', required: false, description: 'Metadatenquelle (z.B. "tmdb", "omdb")' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Metadaten erfolgreich abgerufen',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Metadaten erfolgreich abgerufen' },
                metadata: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', example: 'Beispielfilm' },
                        description: { type: 'string', example: 'Ein Beispielfilm über...' },
                        releaseYear: { type: 'number', example: 2023 }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medium nicht gefunden' }),
    __param(0, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('source')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "fetchMetadata", null);
__decorate([
    (0, common_1.Post)('media/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Metadaten für ein Medium aktualisieren' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Neuer Titel' },
                description: { type: 'string', example: 'Neue Beschreibung' },
                releaseYear: { type: 'number', example: 2023 },
                genres: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Action', 'Drama']
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Metadaten erfolgreich aktualisiert',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Metadaten erfolgreich aktualisiert' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medium nicht gefunden' }),
    __param(0, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "updateMetadata", null);
__decorate([
    (0, common_1.Post)('extract/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "extractMetadata", null);
__decorate([
    (0, common_1.Post)('analyze-directory'),
    __param(0, (0, common_1.Body)('path')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "analyzeDirectory", null);
exports.MetadataController = MetadataController = __decorate([
    (0, swagger_1.ApiTags)('Metadaten'),
    (0, common_1.Controller)('metadata'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [metadata_service_1.MetadataService,
        logger_service_1.LoggerService])
], MetadataController);
//# sourceMappingURL=metadata.controller.js.map