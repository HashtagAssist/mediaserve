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
var ProgressController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressController = void 0;
const common_1 = require("@nestjs/common");
const progress_service_1 = require("./progress.service");
const create_progress_dto_1 = require("./dto/create-progress.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const update_progress_dto_1 = require("./dto/update-progress.dto");
const swagger_1 = require("@nestjs/swagger");
const logger_service_1 = require("../shared/services/logger.service");
let ProgressController = ProgressController_1 = class ProgressController {
    constructor(progressService, loggerService) {
        this.progressService = progressService;
        this.loggerService = loggerService;
        this.logger = new common_1.Logger(ProgressController_1.name);
    }
    async create(req, createProgressDto) {
        this.logger.debug(`Speichere Fortschritt für Medium ${createProgressDto.mediaId}`, 'ProgressController');
        try {
            const userId = req.user.id;
            const progress = await this.progressService.create(userId, createProgressDto);
            return {
                message: 'Fortschritt erfolgreich gespeichert',
                progress,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Fehler beim Speichern des Fortschritts: ${error.message}`, error.stack, 'ProgressController');
            throw new common_1.InternalServerErrorException('Fehler beim Speichern des Fortschritts');
        }
    }
    async findAll(req) {
        this.logger.debug('Rufe alle Fortschritte ab', 'ProgressController');
        try {
            const userId = req.user.id;
            const progress = await this.progressService.findAllByUser(userId);
            return progress;
        }
        catch (error) {
            this.logger.error(`Fehler beim Abrufen der Fortschritte: ${error.message}`, error.stack, 'ProgressController');
            throw new common_1.InternalServerErrorException('Fehler beim Abrufen der Fortschritte');
        }
    }
    async findContinueWatching(req, limit) {
        this.logger.debug('Rufe "Weiterschauen"-Liste ab', 'ProgressController');
        try {
            const userId = req.user.id;
            const progress = await this.progressService.findContinueWatching(userId, limit);
            return progress;
        }
        catch (error) {
            this.logger.error(`Fehler beim Abrufen der "Weiterschauen"-Liste: ${error.message}`, error.stack, 'ProgressController');
            throw new common_1.InternalServerErrorException('Fehler beim Abrufen der "Weiterschauen"-Liste');
        }
    }
    async findOne(req, mediaId) {
        this.logger.debug(`Rufe Fortschritt für Medium ${mediaId} ab`, 'ProgressController');
        try {
            const userId = req.user.id;
            const progress = await this.progressService.findOne(userId, mediaId);
            if (!progress) {
                return { message: 'Kein Fortschritt gefunden' };
            }
            return progress;
        }
        catch (error) {
            this.logger.error(`Fehler beim Abrufen des Fortschritts: ${error.message}`, error.stack, 'ProgressController');
            throw new common_1.InternalServerErrorException('Fehler beim Abrufen des Fortschritts');
        }
    }
    async remove(req, mediaId) {
        this.logger.debug(`Lösche Fortschritt für Medium ${mediaId}`, 'ProgressController');
        try {
            const userId = req.user.id;
            await this.progressService.remove(userId, mediaId);
            return { message: 'Fortschritt erfolgreich gelöscht' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Fehler beim Löschen des Fortschritts: ${error.message}`, error.stack, 'ProgressController');
            throw new common_1.InternalServerErrorException('Fehler beim Löschen des Fortschritts');
        }
    }
    async update(req, mediaId, updateProgressDto) {
        this.logger.debug(`Aktualisiere Fortschritt für Medium ${mediaId}`, 'ProgressController');
        try {
            const userId = req.user.id;
            const progress = await this.progressService.update(userId, mediaId, updateProgressDto);
            return {
                message: 'Fortschritt erfolgreich aktualisiert',
                progress,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Fehler beim Aktualisieren des Fortschritts: ${error.message}`, error.stack, 'ProgressController');
            throw new common_1.InternalServerErrorException('Fehler beim Aktualisieren des Fortschritts');
        }
    }
    async getProgress(mediaId, req) {
        this.logger.debug(`Rufe Fortschritt für Medium ${mediaId} ab`, 'ProgressController');
        const userId = req.user.id;
        return this.progressService.getProgress(userId, mediaId);
    }
    async updateProgress(mediaId, updateProgressDto, req) {
        this.logger.debug(`Aktualisiere Fortschritt für Medium ${mediaId} zu Position ${updateProgressDto.position}`, 'ProgressController');
        const userId = req.user.id;
        return this.progressService.updateMediaProgress(userId, mediaId, updateProgressDto);
    }
    async getAllProgress(req) {
        this.logger.debug('Rufe alle Fortschritte für Benutzer ab', 'ProgressController');
        const userId = req.user.id;
        return this.progressService.getUserProgress(userId);
    }
    async getContinueWatching(req) {
        this.logger.debug('Rufe Weiterschauen-Liste für Benutzer ab', 'ProgressController');
        const userId = req.user.id;
        return this.progressService.findContinueWatching(userId);
    }
};
exports.ProgressController = ProgressController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Speichert den Wiedergabefortschritt eines Mediums' }),
    (0, swagger_1.ApiBody)({ type: create_progress_dto_1.CreateProgressDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Fortschritt erfolgreich gespeichert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medium oder Benutzer nicht gefunden' }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_progress_dto_1.CreateProgressDto]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Ruft alle Fortschritte des Benutzers ab' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste aller Fortschritte' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Ruft die "Weiterschauen"-Liste des Benutzers ab' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste der unvollständig angesehenen Medien' }),
    (0, common_1.Get)('continue-watching'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "findContinueWatching", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Ruft den Fortschritt für ein bestimmtes Medium ab' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fortschritt gefunden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kein Fortschritt gefunden' }),
    (0, common_1.Get)(':mediaId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Löscht den Fortschritt für ein bestimmtes Medium' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fortschritt erfolgreich gelöscht' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Fortschritt nicht gefunden' }),
    (0, common_1.Delete)(':mediaId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Aktualisiert den Fortschritt für ein bestimmtes Medium' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums' }),
    (0, swagger_1.ApiBody)({ type: update_progress_dto_1.UpdateProgressDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fortschritt erfolgreich aktualisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Fortschritt nicht gefunden' }),
    (0, common_1.Patch)(':mediaId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_progress_dto_1.UpdateProgressDto]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('media/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Wiedergabefortschritt eines Mediums abrufen' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Wiedergabefortschritt',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
                mediaId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
                position: { type: 'number', example: 1800 },
                duration: { type: 'number', example: 7200 },
                completed: { type: 'boolean', example: false },
                lastPlayed: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medium nicht gefunden' }),
    __param(0, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Post)('media/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Wiedergabefortschritt aktualisieren' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiBody)({
        type: update_progress_dto_1.UpdateProgressDto,
        examples: {
            'Fortschritt aktualisieren': {
                value: {
                    position: 1800,
                    duration: 7200,
                    completed: false
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Fortschritt erfolgreich aktualisiert',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
                mediaId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
                position: { type: 'number', example: 1800 },
                duration: { type: 'number', example: 7200 },
                completed: { type: 'boolean', example: false },
                lastPlayed: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Ungültige Daten' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medium nicht gefunden' }),
    __param(0, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_progress_dto_1.UpdateProgressDto, Object]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "updateProgress", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Alle Fortschritte des Benutzers abrufen' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste aller Medienwiedergabefortschritte',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                    mediaId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
                    media: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
                            title: { type: 'string', example: 'Beispielvideo' },
                            thumbnailPath: { type: 'string', example: '/pfad/zum/thumbnail.jpg' },
                            type: { type: 'string', example: 'movie' }
                        }
                    },
                    position: { type: 'number', example: 1800 },
                    duration: { type: 'number', example: 7200 },
                    progress: { type: 'number', example: 25 },
                    completed: { type: 'boolean', example: false },
                    lastPlayed: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "getAllProgress", null);
__decorate([
    (0, common_1.Get)('continue-watching'),
    (0, swagger_1.ApiOperation)({
        summary: 'Weiterschauen-Liste abrufen',
        description: 'Ruft eine Liste von Medien ab, die der Benutzer begonnen hat zu schauen, aber noch nicht beendet hat'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Weiterschauen-Liste',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                    mediaId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
                    media: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
                            title: { type: 'string', example: 'Beispielvideo' },
                            thumbnailPath: { type: 'string', example: '/pfad/zum/thumbnail.jpg' },
                            type: { type: 'string', example: 'movie' }
                        }
                    },
                    position: { type: 'number', example: 1800 },
                    duration: { type: 'number', example: 7200 },
                    progress: { type: 'number', example: 25 },
                    lastPlayed: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "getContinueWatching", null);
exports.ProgressController = ProgressController = ProgressController_1 = __decorate([
    (0, swagger_1.ApiTags)('progress'),
    (0, common_1.Controller)('progress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [progress_service_1.ProgressService,
        logger_service_1.LoggerService])
], ProgressController);
//# sourceMappingURL=progress.controller.js.map