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
var ProgressService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const progress_entity_1 = require("./entities/progress.entity");
const media_entity_1 = require("../media/entities/media.entity");
const user_entity_1 = require("../user/entities/user.entity");
let ProgressService = ProgressService_1 = class ProgressService {
    constructor(progressRepository, mediaRepository, userRepository) {
        this.progressRepository = progressRepository;
        this.mediaRepository = mediaRepository;
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(ProgressService_1.name);
    }
    async create(userId, createProgressDto) {
        this.logger.debug(`Speichere Fortschritt für Benutzer ${userId}, Medium ${createProgressDto.mediaId}`, 'ProgressService');
        const media = await this.mediaRepository.findOne({ where: { id: createProgressDto.mediaId } });
        if (!media) {
            throw new common_1.NotFoundException(`Medium mit ID ${createProgressDto.mediaId} nicht gefunden`);
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`Benutzer mit ID ${userId} nicht gefunden`);
        }
        if (createProgressDto.position < 0 || createProgressDto.duration < 0) {
            throw new common_1.BadRequestException('Position und Dauer müssen positive Werte sein');
        }
        const existingProgress = await this.progressRepository.findOne({
            where: {
                user: { id: userId },
                media: { id: createProgressDto.mediaId },
            },
            relations: ['user', 'media'],
        });
        if (existingProgress) {
            existingProgress.position = createProgressDto.position;
            existingProgress.duration = createProgressDto.duration;
            existingProgress.playCount += 1;
            existingProgress.lastPlayedAt = new Date();
            if (createProgressDto.completed !== undefined) {
                existingProgress.completed = createProgressDto.completed;
            }
            else {
                const completionThreshold = 0.95;
                existingProgress.completed =
                    existingProgress.position >= existingProgress.duration * completionThreshold;
            }
            const savedProgress = await this.progressRepository.save(existingProgress);
            this.logger.debug(`Fortschritt aktualisiert: ${savedProgress.position}s / ${savedProgress.duration}s`, 'ProgressService');
            return savedProgress;
        }
        const progress = this.progressRepository.create({
            user,
            media,
            position: createProgressDto.position,
            duration: createProgressDto.duration,
            completed: createProgressDto.completed || false,
            playCount: 1,
            lastPlayedAt: new Date(),
        });
        const savedProgress = await this.progressRepository.save(progress);
        this.logger.debug(`Neuer Fortschritt gespeichert: ${savedProgress.position}s / ${savedProgress.duration}s`, 'ProgressService');
        return savedProgress;
    }
    async findAllByUser(userId) {
        this.logger.debug(`Suche alle Fortschritte für Benutzer ${userId}`, 'ProgressService');
        const progress = await this.progressRepository.find({
            where: { user: { id: userId } },
            relations: ['media'],
            order: { lastPlayedAt: 'DESC' },
        });
        this.logger.debug(`${progress.length} Fortschritte gefunden`, 'ProgressService');
        return progress;
    }
    async findContinueWatching(userId, limit = 10) {
        this.logger.debug(`Suche "Weiterschauen"-Elemente für Benutzer ${userId}`, 'ProgressService');
        const progress = await this.progressRepository.find({
            where: {
                user: { id: userId },
                completed: false,
            },
            relations: ['media'],
            order: { updatedAt: 'DESC' },
            take: limit,
        });
        this.logger.debug(`${progress.length} "Weiterschauen"-Elemente gefunden`, 'ProgressService');
        return progress;
    }
    async findOne(userId, mediaId) {
        this.logger.debug(`Suche Fortschritt für Benutzer ${userId}, Medium ${mediaId}`, 'ProgressService');
        const progress = await this.progressRepository.findOne({
            where: {
                user: { id: userId },
                media: { id: mediaId },
            },
            relations: ['media'],
        });
        if (!progress) {
            this.logger.debug(`Kein Fortschritt gefunden für Benutzer ${userId}, Medium ${mediaId}`, 'ProgressService');
            return null;
        }
        return progress;
    }
    async remove(userId, mediaId) {
        this.logger.debug(`Lösche Fortschritt für Benutzer ${userId}, Medium ${mediaId}`, 'ProgressService');
        const result = await this.progressRepository.delete({
            user: { id: userId },
            media: { id: mediaId },
        });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Fortschritt für Benutzer ${userId}, Medium ${mediaId} nicht gefunden`);
        }
        this.logger.debug(`Fortschritt erfolgreich gelöscht für Benutzer ${userId}, Medium ${mediaId}`, 'ProgressService');
    }
    async getProgress(userId, mediaId) {
        try {
            return await this.findOne(userId, mediaId);
        }
        catch (error) {
            this.logger.error(`Fehler beim Abrufen des Fortschritts für Benutzer ${userId}, Medium ${mediaId}: ${error.message}`, error.stack, 'ProgressService');
            throw error;
        }
    }
    async update(userId, mediaId, updateProgressDto) {
        this.logger.debug(`Aktualisiere Fortschritt für Benutzer ${userId}, Medium ${mediaId}`, 'ProgressService');
        const progress = await this.findOne(userId, mediaId);
        if (!progress) {
            throw new common_1.NotFoundException(`Fortschritt für Benutzer ${userId}, Medium ${mediaId} nicht gefunden`);
        }
        if (updateProgressDto.position !== undefined) {
            progress.position = updateProgressDto.position;
        }
        if (updateProgressDto.duration !== undefined) {
            progress.duration = updateProgressDto.duration;
        }
        if (updateProgressDto.completed !== undefined) {
            progress.completed = updateProgressDto.completed;
        }
        else if (updateProgressDto.position !== undefined && progress.duration) {
            const completionThreshold = 0.95;
            progress.completed = progress.position >= progress.duration * completionThreshold;
        }
        progress.lastPlayedAt = new Date();
        const savedProgress = await this.progressRepository.save(progress);
        this.logger.debug(`Fortschritt aktualisiert: ${savedProgress.position}s / ${savedProgress.duration}s`, 'ProgressService');
        return savedProgress;
    }
    async updateMediaProgress(userId, mediaId, updateProgressDto) {
        return this.update(userId, mediaId, updateProgressDto);
    }
    async getAllUserProgress(userId) {
        return this.getUserProgress(userId);
    }
    async getContinueWatching(userId) {
        return this.findContinueWatching(userId);
    }
    async getUserProgress(userId) {
        this.logger.debug(`Rufe alle Fortschritte für Benutzer ${userId} ab`, 'ProgressService');
        try {
            return await this.progressRepository.find({
                where: { user: { id: userId } },
                relations: ['media'],
                order: { lastPlayedAt: 'DESC' }
            });
        }
        catch (error) {
            this.logger.error(`Fehler beim Abrufen aller Fortschritte für Benutzer ${userId}: ${error.message}`, error.stack, 'ProgressService');
            throw error;
        }
    }
};
exports.ProgressService = ProgressService;
exports.ProgressService = ProgressService = ProgressService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(progress_entity_1.Progress)),
    __param(1, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProgressService);
//# sourceMappingURL=progress.service.js.map