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
exports.MetadataService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const media_entity_1 = require("../media/entities/media.entity");
const util_1 = require("util");
const child_process_1 = require("child_process");
const path = require("path");
const fs = require("fs/promises");
const logger_service_1 = require("../shared/services/logger.service");
const config_1 = require("@nestjs/config");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let MetadataService = class MetadataService {
    constructor(mediaRepository, logger, configService) {
        this.mediaRepository = mediaRepository;
        this.logger = logger;
        this.configService = configService;
        this.supportedFormats = new Set([
            'mp4', 'mkv', 'avi', 'mov',
            'mp3', 'wav', 'flac', 'm4a'
        ]);
    }
    async onModuleInit() {
        this.ffmpegAvailable = this.configService.get('FFMPEG_INSTALLED', false);
        if (!this.ffmpegAvailable) {
            this.logger.warn('FFmpeg ist nicht verfügbar. Metadatenextraktion wird eingeschränkt sein.', 'MetadataService');
        }
        else {
            this.logger.debug('FFmpeg ist verfügbar und wird für Metadatenextraktion verwendet.', 'MetadataService');
        }
    }
    async extractMetadata(mediaId) {
        const media = await this.mediaRepository.findOne({ where: { id: mediaId } });
        if (!media) {
            throw new common_1.NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
        }
        if (!this.ffmpegAvailable) {
            this.logger.warn(`Metadatenextraktion für Medium ${mediaId} übersprungen - FFmpeg nicht verfügbar`, 'MetadataService');
            return media;
        }
        try {
            const metadata = await this.getFFmpegMetadata(media.path);
            await this.updateMediaMetadata(media, metadata);
            return media;
        }
        catch (error) {
            this.logger.error(`Fehler beim Extrahieren der Metadaten: ${error.message}`, error.stack, 'MetadataService');
            throw new common_1.InternalServerErrorException(`Fehler beim Extrahieren der Metadaten: ${error.message}`);
        }
    }
    async getFFmpegMetadata(filePath) {
        try {
            const { stdout } = await execAsync(`ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`);
            return JSON.parse(stdout);
        }
        catch (error) {
            throw new Error(`FFmpeg Fehler: ${error.message}`);
        }
    }
    async updateMediaMetadata(media, metadata) {
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
        const duration = parseFloat(metadata.format.duration);
        const fileSize = parseInt(metadata.format.size);
        const format = metadata.format.format_name;
        const updateData = {
            duration,
            format,
            fileSize,
            processed: true,
        };
        if (videoStream) {
            updateData.resolution = videoStream.width && videoStream.height
                ? `${videoStream.width}x${videoStream.height}`
                : undefined;
            updateData.codec = videoStream.codec_name;
            updateData.frameRate = videoStream.r_frame_rate;
        }
        if (audioStream) {
            updateData.audioCodec = audioStream.codec_name;
            updateData.audioChannels = audioStream.channels;
            updateData.sampleRate = audioStream.sample_rate;
        }
        if (metadata.format.tags) {
            if (!media.title && metadata.format.tags.title) {
                updateData.title = metadata.format.tags.title;
            }
            if (!media.releaseYear && metadata.format.tags.date) {
                updateData.releaseYear = new Date(metadata.format.tags.date).getFullYear();
            }
        }
        Object.assign(media, updateData);
        return await this.mediaRepository.save(media);
    }
    async analyzeDirectory(directoryPath, options = {}) {
        const defaultOptions = {
            recursive: true,
            maxDepth: 10,
            includeHidden: false,
        };
        const opts = Object.assign(Object.assign({}, defaultOptions), options);
        this.logger.debug(`Starte Verzeichnisanalyse: ${directoryPath} (rekursiv: ${opts.recursive}, maxDepth: ${opts.maxDepth})`, 'MetadataService');
        try {
            const mediaFiles = await this.findMediaFiles(directoryPath, opts);
            this.logger.debug(`Verzeichnisanalyse abgeschlossen. ${mediaFiles.length} Mediendateien gefunden.`, 'MetadataService');
            return mediaFiles;
        }
        catch (error) {
            this.logger.error(`Fehler beim Analysieren des Verzeichnisses: ${error.message}`, error.stack, 'MetadataService');
            throw new Error(`Fehler beim Analysieren des Verzeichnisses: ${error.message}`);
        }
    }
    async findMediaFiles(dirPath, options, currentDepth = 0) {
        if (currentDepth > (options.maxDepth || 10)) {
            this.logger.debug(`Maximale Tiefe erreicht in: ${dirPath}`, 'MetadataService');
            return [];
        }
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        let mediaFiles = [];
        for (const entry of entries) {
            if (!options.includeHidden && entry.name.startsWith('.')) {
                continue;
            }
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory() && options.recursive) {
                const subDirFiles = await this.findMediaFiles(fullPath, options, currentDepth + 1);
                mediaFiles = [...mediaFiles, ...subDirFiles];
            }
            else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase().slice(1);
                if (this.supportedFormats.has(ext)) {
                    const mediaFile = {
                        path: fullPath,
                        type: this.getMediaType(fullPath),
                        title: path.basename(fullPath, path.extname(fullPath)),
                    };
                    this.logger.debug(`Gefundene Mediendatei: ${fullPath} (Typ: ${mediaFile.type})`, 'MetadataService');
                    mediaFiles.push(mediaFile);
                }
            }
        }
        return mediaFiles;
    }
    getMediaType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return ['.mp3', '.wav', '.flac', '.m4a'].includes(ext) ? 'music' : 'movie';
    }
    async getMediaMetadata(mediaId) {
        this.logger.debug(`Rufe Metadaten für Medium ${mediaId} ab`, 'MetadataService');
        const media = await this.mediaRepository.findOne({
            where: { id: mediaId },
        });
        if (!media) {
            this.logger.warn(`Medium ${mediaId} nicht gefunden`, 'MetadataService');
            throw new common_1.NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
        }
        const metadata = {
            title: media.title,
            description: media.description,
            releaseYear: media.releaseYear,
            director: media.director,
            actors: media.actors,
            genres: media.genres,
            duration: media.duration,
            language: media.language,
        };
        return metadata;
    }
    async fetchMetadata(mediaId, source) {
        this.logger.debug(`Rufe Metadaten für Medium ${mediaId} von Quelle ${source || 'Standard'} ab`, 'MetadataService');
        const media = await this.mediaRepository.findOne({
            where: { id: mediaId },
        });
        if (!media) {
            this.logger.warn(`Medium ${mediaId} nicht gefunden`, 'MetadataService');
            throw new common_1.NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
        }
        const metadata = {
            title: media.title || 'Unbekannter Titel',
            description: 'Beschreibung aus externer Quelle',
            releaseYear: 2023,
            director: 'Beispiel Regisseur',
            actors: ['Schauspieler 1', 'Schauspieler 2'],
            genres: ['Action', 'Drama'],
            duration: media.duration || 0,
            language: 'de',
        };
        return metadata;
    }
    async updateMetadata(mediaId, metadataDto) {
        this.logger.debug(`Aktualisiere Metadaten für Medium ${mediaId}`, 'MetadataService');
        const media = await this.mediaRepository.findOne({
            where: { id: mediaId },
        });
        if (!media) {
            this.logger.warn(`Medium ${mediaId} nicht gefunden`, 'MetadataService');
            throw new common_1.NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
        }
        Object.assign(media, metadataDto);
        await this.mediaRepository.save(media);
    }
};
exports.MetadataService = MetadataService;
exports.MetadataService = MetadataService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        logger_service_1.LoggerService,
        config_1.ConfigService])
], MetadataService);
//# sourceMappingURL=metadata.service.js.map