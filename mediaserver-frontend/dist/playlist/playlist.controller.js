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
exports.PlaylistController = void 0;
const common_1 = require("@nestjs/common");
const playlist_service_1 = require("./playlist.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const logger_service_1 = require("../shared/services/logger.service");
const create_playlist_dto_1 = require("./dto/create-playlist.dto");
const update_playlist_dto_1 = require("./dto/update-playlist.dto");
const swagger_1 = require("@nestjs/swagger");
let PlaylistController = class PlaylistController {
    constructor(playlistService, logger) {
        this.playlistService = playlistService;
        this.logger = logger;
    }
    async create(req, createPlaylistDto) {
        const userId = req.user.id;
        this.logger.debug(`Anfrage zum Erstellen einer neuen Playlist von Benutzer ${userId}`, 'PlaylistController');
        return await this.playlistService.create(userId, createPlaylistDto);
    }
    async findAll(req) {
        const userId = req.user.id;
        this.logger.debug(`Anfrage zum Abrufen aller Playlists für Benutzer ${userId}`, 'PlaylistController');
        return await this.playlistService.findAll(userId);
    }
    async getUserPlaylists(req) {
        const userId = req.user.id;
        this.logger.debug(`Anfrage zum Abrufen der Playlists von Benutzer ${userId}`, 'PlaylistController');
        return await this.playlistService.getUserPlaylists(userId);
    }
    async getPublicPlaylists(limit) {
        this.logger.debug(`Anfrage zum Abrufen öffentlicher Playlists`, 'PlaylistController');
        return await this.playlistService.getPublicPlaylists(limit);
    }
    async findOne(req, id) {
        const userId = req.user.id;
        this.logger.debug(`Anfrage zum Abrufen der Playlist ${id} von Benutzer ${userId}`, 'PlaylistController');
        return await this.playlistService.findOne(id, userId);
    }
    async update(req, id, updatePlaylistDto) {
        const userId = req.user.id;
        this.logger.debug(`Anfrage zum Aktualisieren der Playlist ${id} von Benutzer ${userId}`, 'PlaylistController');
        return await this.playlistService.update(id, userId, updatePlaylistDto);
    }
    async remove(req, id) {
        const userId = req.user.id;
        this.logger.debug(`Anfrage zum Löschen der Playlist ${id} von Benutzer ${userId}`, 'PlaylistController');
        await this.playlistService.remove(id, userId);
        return { message: 'Playlist erfolgreich gelöscht' };
    }
    async addItem(req, id, mediaId) {
        const userId = req.user.id;
        this.logger.debug(`Anfrage zum Hinzufügen von Medium ${mediaId} zur Playlist ${id} von Benutzer ${userId}`, 'PlaylistController');
        return await this.playlistService.addItem(id, mediaId, userId);
    }
    async removeItem(req, id, mediaId) {
        const userId = req.user.id;
        this.logger.debug(`Anfrage zum Entfernen von Medium ${mediaId} aus Playlist ${id} von Benutzer ${userId}`, 'PlaylistController');
        return await this.playlistService.removeItem(id, mediaId, userId);
    }
};
exports.PlaylistController = PlaylistController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Neue Playlist erstellen' }),
    (0, swagger_1.ApiBody)({
        type: create_playlist_dto_1.CreatePlaylistDto,
        examples: {
            'Neue Playlist': {
                value: {
                    name: 'Meine Lieblingsfilme',
                    description: 'Eine Sammlung meiner Lieblingsfilme'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Playlist erfolgreich erstellt',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                name: { type: 'string', example: 'Meine Lieblingsfilme' },
                description: { type: 'string', example: 'Eine Sammlung meiner Lieblingsfilme' },
                userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
                createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Ungültige Daten' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_playlist_dto_1.CreatePlaylistDto]),
    __metadata("design:returntype", Promise)
], PlaylistController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Alle Playlisten des Benutzers abrufen' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste der Playlisten',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                    name: { type: 'string', example: 'Meine Lieblingsfilme' },
                    description: { type: 'string', example: 'Eine Sammlung meiner Lieblingsfilme' },
                    mediaCount: { type: 'number', example: 5 },
                    userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
                    createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' },
                    updatedAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlaylistController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlaylistController.prototype, "getUserPlaylists", null);
__decorate([
    (0, common_1.Get)('public'),
    __param(0, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PlaylistController.prototype, "getPublicPlaylists", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eine bestimmte Playlist abrufen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Playlist', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Die abgerufene Playlist mit Medien',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                name: { type: 'string', example: 'Meine Lieblingsfilme' },
                description: { type: 'string', example: 'Eine Sammlung meiner Lieblingsfilme' },
                userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
                media: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
                            title: { type: 'string', example: 'Beispielvideo' },
                            thumbnailPath: { type: 'string', example: '/pfad/zum/thumbnail.jpg' },
                            type: { type: 'string', example: 'movie' },
                            duration: { type: 'number', example: 7200 }
                        }
                    }
                },
                createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' },
                updatedAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Playlist nicht gefunden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PlaylistController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Playlist aktualisieren' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Playlist', type: 'string' }),
    (0, swagger_1.ApiBody)({
        type: update_playlist_dto_1.UpdatePlaylistDto,
        examples: {
            'Playlist aktualisieren': {
                value: {
                    name: 'Aktualisierter Name',
                    description: 'Aktualisierte Beschreibung'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Playlist erfolgreich aktualisiert',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                name: { type: 'string', example: 'Aktualisierter Name' },
                description: { type: 'string', example: 'Aktualisierte Beschreibung' },
                userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
                updatedAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Ungültige Daten' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Playlist nicht gefunden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_playlist_dto_1.UpdatePlaylistDto]),
    __metadata("design:returntype", Promise)
], PlaylistController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Playlist löschen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Playlist', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Playlist erfolgreich gelöscht',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Playlist erfolgreich gelöscht' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Playlist nicht gefunden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PlaylistController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/items/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Medium zur Playlist hinzufügen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Playlist', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Medium erfolgreich zur Playlist hinzugefügt',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Medium erfolgreich zur Playlist hinzugefügt' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Playlist oder Medium nicht gefunden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PlaylistController.prototype, "addItem", null);
__decorate([
    (0, common_1.Delete)(':id/items/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Medium aus Playlist entfernen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Playlist', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Medium erfolgreich aus Playlist entfernt',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Medium erfolgreich aus Playlist entfernt' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Playlist oder Medium nicht gefunden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PlaylistController.prototype, "removeItem", null);
exports.PlaylistController = PlaylistController = __decorate([
    (0, swagger_1.ApiTags)('Playlisten'),
    (0, common_1.Controller)('playlists'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [playlist_service_1.PlaylistService,
        logger_service_1.LoggerService])
], PlaylistController);
//# sourceMappingURL=playlist.controller.js.map