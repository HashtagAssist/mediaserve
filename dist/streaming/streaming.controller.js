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
exports.StreamingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const streaming_service_1 = require("./streaming.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const logger_service_1 = require("../shared/services/logger.service");
let StreamingController = class StreamingController {
    constructor(streamingService, logger) {
        this.streamingService = streamingService;
        this.logger = logger;
    }
    async streamMedia(id, req, res, range) {
        const userId = req.user.id;
        this.logger.debug(`Streaming-Anfrage für Medium ${id} von Benutzer ${userId}`, 'StreamingController');
        return await this.streamingService.streamMedia(id, userId, res, range);
    }
    async getMediaInfo(req, id) {
        const userId = req.user.id;
        this.logger.debug(`Medieninfo-Anfrage für Medium ${id} von Benutzer ${userId}`, 'StreamingController');
        return await this.streamingService.getMediaInfo(id, userId);
    }
    async getSubtitles(req, id) {
        const userId = req.user.id;
        this.logger.debug(`Untertitel-Anfrage für Medium ${id} von Benutzer ${userId}`, 'StreamingController');
        return await this.streamingService.getSubtitles(id, userId);
    }
    async getSubtitleFile(req, res, id, fileName) {
        const userId = req.user.id;
        this.logger.debug(`Untertiteldatei-Anfrage für Medium ${id}, Datei ${fileName} von Benutzer ${userId}`, 'StreamingController');
        return await this.streamingService.getSubtitleFile(id, fileName, userId, res);
    }
};
exports.StreamingController = StreamingController;
__decorate([
    (0, common_1.Get)(':id/stream'),
    (0, swagger_1.ApiOperation)({
        summary: 'Medium streamen',
        description: 'Streamt ein Medium mit optionalem Range-Header für seitenweises Laden'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiHeader)({
        name: 'range',
        required: false,
        description: 'HTTP Range-Header für partielles Laden (z.B. "bytes=0-1023")'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vollständiges Medium' }),
    (0, swagger_1.ApiResponse)({ status: 206, description: 'Teilinhalt des Mediums (Partial Content)' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medium nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __param(3, (0, common_1.Headers)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", Promise)
], StreamingController.prototype, "streamMedia", null);
__decorate([
    (0, common_1.Get)(':id/info'),
    (0, swagger_1.ApiOperation)({
        summary: 'Medieninformationen abrufen',
        description: 'Ruft technische Informationen zum Medium ab'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Medieninformationen',
        schema: {
            type: 'object',
            properties: {
                format: { type: 'string', example: 'matroska,webm' },
                duration: { type: 'number', example: 7260.123 },
                size: { type: 'number', example: 1073741824 },
                bitrate: { type: 'number', example: 2500000 },
                videoCodec: { type: 'string', example: 'h264' },
                audioCodec: { type: 'string', example: 'aac' },
                resolution: { type: 'string', example: '1920x1080' },
                fps: { type: 'number', example: 24 }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medium nicht gefunden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StreamingController.prototype, "getMediaInfo", null);
__decorate([
    (0, common_1.Get)(':id/subtitles'),
    (0, swagger_1.ApiOperation)({
        summary: 'Untertitel-Informationen abrufen',
        description: 'Ruft verfügbare Untertiteldateien für ein Medium ab'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Verfügbare Untertitel',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    fileName: { type: 'string', example: 'subtitles.de.srt' },
                    language: { type: 'string', example: 'de' },
                    label: { type: 'string', example: 'Deutsch' }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medium nicht gefunden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StreamingController.prototype, "getSubtitles", null);
__decorate([
    (0, common_1.Get)(':id/subtitles/:fileName'),
    (0, swagger_1.ApiOperation)({
        summary: 'Untertiteldatei abrufen',
        description: 'Ruft eine bestimmte Untertiteldatei für ein Medium ab'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'fileName', description: 'Name der Untertiteldatei', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Untertiteldatei' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medium oder Untertiteldatei nicht gefunden' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Param)('fileName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], StreamingController.prototype, "getSubtitleFile", null);
exports.StreamingController = StreamingController = __decorate([
    (0, swagger_1.ApiTags)('Streaming'),
    (0, common_1.Controller)('streaming'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [streaming_service_1.StreamingService,
        logger_service_1.LoggerService])
], StreamingController);
//# sourceMappingURL=streaming.controller.js.map