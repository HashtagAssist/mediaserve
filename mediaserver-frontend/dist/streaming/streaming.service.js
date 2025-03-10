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
exports.StreamingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const media_entity_1 = require("../media/entities/media.entity");
const logger_service_1 = require("../shared/services/logger.service");
const config_1 = require("@nestjs/config");
const fs = require("fs");
const path = require("path");
const fs_1 = require("fs");
const util_1 = require("util");
const progress_service_1 = require("../progress/progress.service");
const statAsync = (0, util_1.promisify)(fs_1.stat);
let StreamingService = class StreamingService {
    constructor(mediaRepository, logger, configService, progressService) {
        this.mediaRepository = mediaRepository;
        this.logger = logger;
        this.configService = configService;
        this.progressService = progressService;
    }
    async streamMedia(mediaId, userId, response, range) {
        this.logger.debug(`Streaming-Anfrage für Medium ${mediaId} von Benutzer ${userId}${range ? ' mit Range: ' + range : ''}`, 'StreamingService');
        const media = await this.mediaRepository.findOne({
            where: { id: mediaId },
            relations: ['library'],
        });
        if (!media) {
            throw new common_1.NotFoundException(`Medium ${mediaId} nicht gefunden`);
        }
        const filePath = media.path;
        try {
            await statAsync(filePath);
        }
        catch (error) {
            this.logger.error(`Datei nicht gefunden: ${filePath}`, error.stack, 'StreamingService');
            throw new common_1.NotFoundException(`Datei nicht gefunden: ${filePath}`);
        }
        const mimeType = this.getMimeType(filePath);
        const { size } = await statAsync(filePath);
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
            const chunkSize = end - start + 1;
            this.logger.debug(`Streaming-Range: ${start}-${end}/${size} (${chunkSize} Bytes)`, 'StreamingService');
            response.status(206);
            response.set({
                'Content-Range': `bytes ${start}-${end}/${size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': mimeType,
            });
            const stream = (0, fs_1.createReadStream)(filePath, { start, end });
            return new common_1.StreamableFile(stream);
        }
        this.logger.debug(`Streaming gesamte Datei: ${size} Bytes`, 'StreamingService');
        response.set({
            'Content-Length': size,
            'Content-Type': mimeType,
            'Accept-Ranges': 'bytes',
        });
        const stream = (0, fs_1.createReadStream)(filePath);
        return new common_1.StreamableFile(stream);
    }
    async getMediaInfo(mediaId, userId) {
        this.logger.debug(`Medieninfo-Anfrage für Medium ${mediaId} von Benutzer ${userId}`, 'StreamingService');
        const media = await this.mediaRepository.findOne({
            where: { id: mediaId },
            relations: ['library'],
        });
        if (!media) {
            throw new common_1.NotFoundException(`Medium ${mediaId} nicht gefunden`);
        }
        let progress = null;
        try {
            progress = await this.progressService.getProgress(userId, mediaId);
        }
        catch (error) {
        }
        const mediaInfo = {
            id: media.id,
            title: media.title,
            type: media.type,
            duration: media.duration,
            format: media.format,
            resolution: media.resolution,
            codec: media.codec,
            audioCodec: media.audioCodec,
            audioChannels: media.audioChannels,
            thumbnailPath: media.thumbnailPath ? `/api/media/${media.id}/thumbnail` : null,
            streamUrl: `/api/streaming/${media.id}`,
            progress: progress ? {
                position: progress.position,
                duration: progress.duration,
                completed: progress.completed,
                lastPlayedAt: progress.lastPlayedAt,
            } : null,
        };
        return mediaInfo;
    }
    getMimeType(filePath) {
        const extension = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.ogg': 'video/ogg',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.flac': 'audio/flac',
            '.m4a': 'audio/mp4',
            '.aac': 'audio/aac',
            '.mkv': 'video/x-matroska',
            '.avi': 'video/x-msvideo',
            '.mov': 'video/quicktime',
            '.wmv': 'video/x-ms-wmv',
        };
        return mimeTypes[extension] || 'application/octet-stream';
    }
    async getSubtitles(mediaId, userId) {
        this.logger.debug(`Untertitel-Anfrage für Medium ${mediaId} von Benutzer ${userId}`, 'StreamingService');
        const media = await this.mediaRepository.findOne({
            where: { id: mediaId },
            relations: ['library'],
        });
        if (!media) {
            throw new common_1.NotFoundException(`Medium ${mediaId} nicht gefunden`);
        }
        const filePath = media.path;
        const fileDir = path.dirname(filePath);
        const fileName = path.basename(filePath, path.extname(filePath));
        const subtitles = [];
        try {
            const files = await fs.promises.readdir(fileDir);
            for (const file of files) {
                if (file.startsWith(fileName) && this.isSubtitleFile(file)) {
                    const language = this.extractLanguageFromSubtitleFile(file);
                    subtitles.push({
                        language,
                        label: this.getLanguageLabel(language),
                        url: `/api/streaming/${mediaId}/subtitles/${encodeURIComponent(file)}`,
                        path: path.join(fileDir, file),
                    });
                }
            }
        }
        catch (error) {
            this.logger.error(`Fehler beim Suchen nach Untertiteln: ${error.message}`, error.stack, 'StreamingService');
        }
        return subtitles;
    }
    async getSubtitleFile(mediaId, subtitleFileName, userId, response) {
        this.logger.debug(`Untertiteldatei-Anfrage für Medium ${mediaId}, Datei ${subtitleFileName} von Benutzer ${userId}`, 'StreamingService');
        const media = await this.mediaRepository.findOne({
            where: { id: mediaId },
            relations: ['library'],
        });
        if (!media) {
            throw new common_1.NotFoundException(`Medium ${mediaId} nicht gefunden`);
        }
        const filePath = media.path;
        const fileDir = path.dirname(filePath);
        const subtitlePath = path.join(fileDir, subtitleFileName);
        try {
            await statAsync(subtitlePath);
        }
        catch (error) {
            throw new common_1.NotFoundException(`Untertiteldatei nicht gefunden: ${subtitleFileName}`);
        }
        if (!this.isSubtitleFile(subtitlePath)) {
            throw new common_1.ForbiddenException('Die angeforderte Datei ist keine Untertiteldatei');
        }
        const mimeType = this.getSubtitleMimeType(subtitlePath);
        response.set({
            'Content-Type': mimeType,
        });
        const stream = (0, fs_1.createReadStream)(subtitlePath);
        return new common_1.StreamableFile(stream);
    }
    isSubtitleFile(filePath) {
        const extension = path.extname(filePath).toLowerCase();
        return ['.srt', '.vtt', '.ass', '.ssa', '.sub'].includes(extension);
    }
    getSubtitleMimeType(filePath) {
        const extension = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.srt': 'text/plain',
            '.vtt': 'text/vtt',
            '.ass': 'text/plain',
            '.ssa': 'text/plain',
            '.sub': 'text/plain',
        };
        return mimeTypes[extension] || 'text/plain';
    }
    extractLanguageFromSubtitleFile(fileName) {
        const parts = fileName.split('.');
        if (parts.length >= 3) {
            const possibleLanguage = parts[parts.length - 2].toLowerCase();
            const languageCodes = {
                'en': 'en', 'eng': 'en', 'english': 'en',
                'de': 'de', 'ger': 'de', 'german': 'de', 'deutsch': 'de',
                'fr': 'fr', 'fre': 'fr', 'french': 'fr', 'français': 'fr',
                'es': 'es', 'spa': 'es', 'spanish': 'es', 'español': 'es',
                'it': 'it', 'ita': 'it', 'italian': 'it', 'italiano': 'it',
            };
            if (languageCodes[possibleLanguage]) {
                return languageCodes[possibleLanguage];
            }
        }
        return 'unknown';
    }
    getLanguageLabel(languageCode) {
        const languageLabels = {
            'en': 'Englisch',
            'de': 'Deutsch',
            'fr': 'Französisch',
            'es': 'Spanisch',
            'it': 'Italienisch',
            'unknown': 'Unbekannt',
        };
        return languageLabels[languageCode] || languageCode;
    }
};
exports.StreamingService = StreamingService;
exports.StreamingService = StreamingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        logger_service_1.LoggerService,
        config_1.ConfigService,
        progress_service_1.ProgressService])
], StreamingService);
//# sourceMappingURL=streaming.service.js.map