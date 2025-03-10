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
exports.RatingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rating_entity_1 = require("./entities/rating.entity");
const media_entity_1 = require("../media/entities/media.entity");
const user_entity_1 = require("../user/entities/user.entity");
const logger_service_1 = require("../shared/services/logger.service");
let RatingService = class RatingService {
    constructor(ratingRepository, mediaRepository, userRepository, logger) {
        this.ratingRepository = ratingRepository;
        this.mediaRepository = mediaRepository;
        this.userRepository = userRepository;
        this.logger = logger;
    }
    async rateMedia(userId, mediaId, createRatingDto) {
        this.logger.debug(`Bewertung für Medium ${mediaId} von Benutzer ${userId}: ${createRatingDto.value} Sterne`, 'RatingService');
        const media = await this.mediaRepository.findOne({ where: { id: mediaId } });
        if (!media) {
            throw new common_1.NotFoundException(`Medium ${mediaId} nicht gefunden`);
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`Benutzer ${userId} nicht gefunden`);
        }
        let rating = await this.ratingRepository.findOne({
            where: {
                user: { id: userId },
                media: { id: mediaId },
            },
            relations: ['media', 'user'],
        });
        if (!rating) {
            rating = this.ratingRepository.create({
                media,
                user,
                value: createRatingDto.value,
                comment: createRatingDto.comment,
            });
            this.logger.debug(`Neue Bewertung erstellt für Medium ${mediaId} von Benutzer ${userId}`, 'RatingService');
        }
        else {
            rating.value = createRatingDto.value;
            rating.comment = createRatingDto.comment;
            this.logger.debug(`Bestehende Bewertung aktualisiert für Medium ${mediaId} von Benutzer ${userId}`, 'RatingService');
        }
        await this.ratingRepository.save(rating);
        await this.updateMediaAverageRating(mediaId);
        return rating;
    }
    async getUserRating(userId, mediaId) {
        const rating = await this.ratingRepository.findOne({
            where: {
                user: { id: userId },
                media: { id: mediaId },
            },
            relations: ['media'],
        });
        if (!rating) {
            throw new common_1.NotFoundException(`Keine Bewertung gefunden für Medium ${mediaId}`);
        }
        return rating;
    }
    async getMediaRatings(mediaId, userId) {
        return this.ratingRepository.find({
            where: {
                media: { id: mediaId },
            },
            relations: ['user'],
            order: {
                createdAt: 'DESC',
            },
        });
    }
    async getUserRatings(userId) {
        return this.ratingRepository.find({
            where: {
                user: { id: userId },
            },
            relations: ['media'],
            order: {
                createdAt: 'DESC',
            },
        });
    }
    async deleteRating(userId, mediaId) {
        const rating = await this.ratingRepository.findOne({
            where: {
                user: { id: userId },
                media: { id: mediaId },
            },
        });
        if (!rating) {
            throw new common_1.NotFoundException(`Keine Bewertung gefunden für Medium ${mediaId}`);
        }
        await this.ratingRepository.remove(rating);
        this.logger.debug(`Bewertung gelöscht für Medium ${mediaId} von Benutzer ${userId}`, 'RatingService');
        await this.updateMediaAverageRating(mediaId);
    }
    async updateMediaAverageRating(mediaId) {
        const result = await this.ratingRepository
            .createQueryBuilder('rating')
            .select('AVG(rating.value)', 'average')
            .addSelect('COUNT(rating.id)', 'count')
            .where('rating.media.id = :mediaId', { mediaId })
            .getRawOne();
        const averageRating = result.average ? parseFloat(result.average) : 0;
        const ratingCount = parseInt(result.count, 10);
        await this.mediaRepository.update(mediaId, {
            averageRating,
            ratingCount,
        });
        this.logger.debug(`Durchschnittliche Bewertung für Medium ${mediaId} aktualisiert: ${averageRating} (${ratingCount} Bewertungen)`, 'RatingService');
    }
};
exports.RatingService = RatingService;
exports.RatingService = RatingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rating_entity_1.Rating)),
    __param(1, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        logger_service_1.LoggerService])
], RatingService);
//# sourceMappingURL=rating.service.js.map