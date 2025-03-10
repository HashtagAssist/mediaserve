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
exports.ThumbnailController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const thumbnail_service_1 = require("./thumbnail.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const logger_service_1 = require("../shared/services/logger.service");
const swagger_1 = require("@nestjs/swagger");
let ThumbnailController = class ThumbnailController {
    constructor(thumbnailService, logger) {
        this.thumbnailService = thumbnailService;
        this.logger = logger;
    }
    async getThumbnail(mediaId, res) {
        this.logger.debug(`Rufe Thumbnail für Medium ${mediaId} ab`, 'ThumbnailController');
        return this.thumbnailService.getThumbnail(mediaId, res);
    }
    async generateThumbnail(mediaId) {
        this.logger.debug(`Generiere Thumbnail für Medium ${mediaId}`, 'ThumbnailController');
        const thumbnailPath = await this.thumbnailService.generateThumbnail(mediaId);
        return {
            message: 'Thumbnail erfolgreich generiert',
            thumbnailPath
        };
    }
    async uploadThumbnail(mediaId, file) {
        this.logger.debug(`Lade Thumbnail für Medium ${mediaId} hoch`, 'ThumbnailController');
        const thumbnailPath = await this.thumbnailService.saveThumbnail(mediaId, file);
        return {
            message: 'Thumbnail erfolgreich hochgeladen',
            thumbnailPath
        };
    }
    async generateThumbnailsForLibrary(libraryId) {
        this.logger.debug(`Anfrage zur Thumbnail-Generierung für Bibliothek ${libraryId}`, 'ThumbnailController');
        const count = await this.thumbnailService.generateThumbnailsForLibrary(libraryId);
        return {
            message: `Thumbnail-Generierung abgeschlossen`,
            generated: count,
        };
    }
};
exports.ThumbnailController = ThumbnailController;
__decorate([
    (0, common_1.Get)('media/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Thumbnail eines Mediums abrufen' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thumbnail-Bild' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Thumbnail nicht gefunden' }),
    __param(0, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ThumbnailController.prototype, "getThumbnail", null);
__decorate([
    (0, common_1.Post)('media/:mediaId/generate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Thumbnail für ein Medium generieren',
        description: 'Generiert ein Thumbnail aus dem Medieninhalt'
    }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Thumbnail erfolgreich generiert',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Thumbnail erfolgreich generiert' },
                thumbnailPath: { type: 'string', example: '/pfad/zum/thumbnail.jpg' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medium nicht gefunden' }),
    __param(0, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ThumbnailController.prototype, "generateThumbnail", null);
__decorate([
    (0, common_1.Post)('media/:mediaId/upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Benutzerdefiniertes Thumbnail hochladen' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Thumbnail-Bilddatei'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Thumbnail erfolgreich hochgeladen',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Thumbnail erfolgreich hochgeladen' },
                thumbnailPath: { type: 'string', example: '/pfad/zum/thumbnail.jpg' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medium nicht gefunden' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ThumbnailController.prototype, "uploadThumbnail", null);
__decorate([
    (0, common_1.Post)('library/:libraryId'),
    __param(0, (0, common_1.Param)('libraryId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ThumbnailController.prototype, "generateThumbnailsForLibrary", null);
exports.ThumbnailController = ThumbnailController = __decorate([
    (0, swagger_1.ApiTags)('Thumbnails'),
    (0, common_1.Controller)('thumbnails'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [thumbnail_service_1.ThumbnailService,
        logger_service_1.LoggerService])
], ThumbnailController);
//# sourceMappingURL=thumbnail.controller.js.map