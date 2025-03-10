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
exports.ThumbnailService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const media_entity_1 = require("../media/entities/media.entity");
const library_entity_1 = require("../library/entities/library.entity");
const logger_service_1 = require("../shared/services/logger.service");
const config_1 = require("@nestjs/config");
const path = require("path");
const fsPromises = require("fs/promises");
const fs = require("fs");
const util_1 = require("util");
const child_process_1 = require("child_process");
const media_type_enum_1 = require("../media/enums/media-type.enum");
const common_2 = require("@nestjs/common");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let ThumbnailService = class ThumbnailService {
    constructor(mediaRepository, libraryRepository, logger, configService) {
        this.mediaRepository = mediaRepository;
        this.libraryRepository = libraryRepository;
        this.logger = logger;
        this.configService = configService;
        this.thumbnailsDir = path.join(process.cwd(), 'thumbnails');
        this.ffmpegAvailable = this.configService.get('FFMPEG_INSTALLED', false);
        this.ensureThumbnailDir();
    }
    async ensureThumbnailDir() {
        try {
            await fsPromises.mkdir(this.thumbnailsDir, { recursive: true });
            this.logger.debug(`Thumbnail-Verzeichnis erstellt: ${this.thumbnailsDir}`, 'ThumbnailService');
        }
        catch (error) {
            this.logger.error(`Fehler beim Erstellen des Thumbnail-Verzeichnisses: ${error.message}`, error.stack, 'ThumbnailService');
        }
    }
    async getThumbnail(mediaId, res) {
        this.logger.debug(`Rufe Thumbnail für Medium ${mediaId} ab`, 'ThumbnailService');
        const media = await this.mediaRepository.findOne({
            where: { id: mediaId },
        });
        if (!media) {
            this.logger.warn(`Medium ${mediaId} nicht gefunden`, 'ThumbnailService');
            throw new common_1.NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
        }
        const thumbnailPath = media.thumbnailPath || path.join(process.cwd(), 'assets', 'default-thumbnail.jpg');
        if (!fs.existsSync(thumbnailPath)) {
            this.logger.warn(`Thumbnail für Medium ${mediaId} nicht gefunden: ${thumbnailPath}`, 'ThumbnailService');
            throw new common_1.NotFoundException(`Thumbnail für Medium ${mediaId} nicht gefunden`);
        }
        const ext = path.extname(thumbnailPath).toLowerCase();
        const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${path.basename(thumbnailPath)}"`,
        });
        const fileStream = fs.createReadStream(thumbnailPath);
        return new common_2.StreamableFile(fileStream);
    }
    async generateThumbnail(mediaId) {
        this.logger.debug(`Generiere Thumbnail für Medium ${mediaId}`, 'ThumbnailService');
        const media = await this.mediaRepository.findOne({
            where: { id: mediaId },
        });
        if (!media) {
            this.logger.warn(`Medium ${mediaId} nicht gefunden`, 'ThumbnailService');
            throw new common_1.NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
        }
        if (media.type !== media_type_enum_1.MediaType.MOVIE) {
            this.logger.debug(`Thumbnail-Generierung für Medium ${mediaId} übersprungen - kein Video`, 'ThumbnailService');
            return null;
        }
        try {
            const thumbnailFilename = `${media.id}.jpg`;
            const thumbnailPath = path.join(this.thumbnailsDir, thumbnailFilename);
            try {
                await fsPromises.access(thumbnailPath);
                this.logger.debug(`Thumbnail für Medium ${mediaId} existiert bereits: ${thumbnailPath}`, 'ThumbnailService');
                if (!media.thumbnailPath) {
                    media.thumbnailPath = thumbnailPath;
                    await this.mediaRepository.save(media);
                }
                return thumbnailPath;
            }
            catch (error) {
            }
            const command = media.duration
                ? `ffmpeg -ss ${Math.floor(media.duration * 0.3)} -i "${media.path}" -vframes 1 -q:v 2 "${thumbnailPath}" -y`
                : `ffmpeg -i "${media.path}" -vframes 1 -q:v 2 "${thumbnailPath}" -y`;
            this.logger.debug(`Generiere Thumbnail für Medium ${mediaId} mit Befehl: ${command}`, 'ThumbnailService');
            await execAsync(command);
            await fsPromises.access(thumbnailPath);
            media.thumbnailPath = thumbnailPath;
            await this.mediaRepository.save(media);
            this.logger.debug(`Thumbnail für Medium ${mediaId} erfolgreich generiert: ${thumbnailPath}`, 'ThumbnailService');
            return thumbnailPath;
        }
        catch (error) {
            this.logger.error(`Fehler bei der Thumbnail-Generierung für Medium ${mediaId}: ${error.message}`, error.stack, 'ThumbnailService');
            throw new common_1.InternalServerErrorException(`Fehler bei der Thumbnail-Generierung: ${error.message}`);
        }
    }
    async saveThumbnail(mediaId, file) {
        this.logger.debug(`Speichere hochgeladenes Thumbnail für Medium ${mediaId}`, 'ThumbnailService');
        const media = await this.mediaRepository.findOne({
            where: { id: mediaId },
        });
        if (!media) {
            this.logger.warn(`Medium ${mediaId} nicht gefunden`, 'ThumbnailService');
            throw new common_1.NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
        }
        const thumbnailDir = path.join(process.cwd(), 'thumbnails');
        if (!fs.existsSync(thumbnailDir)) {
            fs.mkdirSync(thumbnailDir, { recursive: true });
        }
        const thumbnailPath = path.join(thumbnailDir, `${mediaId}${path.extname(file.originalname)}`);
        await fsPromises.writeFile(thumbnailPath, file.buffer);
        media.thumbnailPath = thumbnailPath;
        await this.mediaRepository.save(media);
        return thumbnailPath;
    }
    async generateThumbnailsForLibrary(libraryId) {
        this.logger.debug(`Generiere Thumbnails für Bibliothek ${libraryId}`, 'ThumbnailService');
        const library = await this.libraryRepository.findOne({
            where: { id: libraryId },
        });
        if (!library) {
            this.logger.warn(`Bibliothek ${libraryId} nicht gefunden`, 'ThumbnailService');
            throw new common_1.NotFoundException(`Bibliothek mit ID ${libraryId} nicht gefunden`);
        }
        const media = await this.mediaRepository.find({
            where: {
                library: { id: libraryId },
                type: media_type_enum_1.MediaType.MOVIE,
                thumbnailPath: null,
            },
        });
        let count = 0;
        for (const item of media) {
            try {
                await this.generateThumbnail(item.id);
                count++;
            }
            catch (error) {
                this.logger.error(`Fehler bei der Thumbnail-Generierung für Medium ${item.id}: ${error.message}`, error.stack, 'ThumbnailService');
            }
        }
        return count;
    }
};
exports.ThumbnailService = ThumbnailService;
exports.ThumbnailService = ThumbnailService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __param(1, (0, typeorm_1.InjectRepository)(library_entity_1.Library)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        logger_service_1.LoggerService,
        config_1.ConfigService])
], ThumbnailService);
//# sourceMappingURL=thumbnail.service.js.map