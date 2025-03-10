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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const media_entity_1 = require("../media/entities/media.entity");
const logger_service_1 = require("../shared/services/logger.service");
let SearchService = class SearchService {
    constructor(mediaRepository, logger) {
        this.mediaRepository = mediaRepository;
        this.logger = logger;
    }
    async search(options) {
        this.logger.debug(`Starte Suche mit Optionen: ${JSON.stringify(options)}`, 'SearchService');
        const limit = options.limit || 20;
        const offset = options.offset || 0;
        const page = Math.floor(offset / limit) + 1;
        const queryBuilder = this.mediaRepository.createQueryBuilder('media')
            .leftJoinAndSelect('media.library', 'library');
        if (options.query) {
            queryBuilder.andWhere('(media.title ILIKE :query OR media.description ILIKE :query)', { query: `%${options.query}%` });
        }
        if (options.type) {
            if (Array.isArray(options.type)) {
                queryBuilder.andWhere('media.type IN (:...types)', { types: options.type });
            }
            else {
                queryBuilder.andWhere('media.type = :type', { type: options.type });
            }
        }
        if (options.genres && options.genres.length > 0) {
            queryBuilder.andWhere('media.genres && ARRAY[:...genres]', { genres: options.genres });
        }
        if (options.year) {
            if (typeof options.year === 'number') {
                queryBuilder.andWhere('media.year = :year', { year: options.year });
            }
            else {
                if (options.year.min !== undefined) {
                    queryBuilder.andWhere('media.year >= :minYear', { minYear: options.year.min });
                }
                if (options.year.max !== undefined) {
                    queryBuilder.andWhere('media.year <= :maxYear', { maxYear: options.year.max });
                }
            }
        }
        if (options.duration) {
            if (options.duration.min !== undefined) {
                queryBuilder.andWhere('media.duration >= :minDuration', { minDuration: options.duration.min });
            }
            if (options.duration.max !== undefined) {
                queryBuilder.andWhere('media.duration <= :maxDuration', { maxDuration: options.duration.max });
            }
        }
        if (options.libraryId) {
            queryBuilder.andWhere('library.id = :libraryId', { libraryId: options.libraryId });
        }
        const sortBy = options.sortBy || 'title';
        const sortOrder = options.sortOrder || 'ASC';
        queryBuilder.orderBy(`media.${sortBy}`, sortOrder);
        queryBuilder.skip(offset).take(limit);
        const [items, total] = await queryBuilder.getManyAndCount();
        const totalPages = Math.ceil(total / limit);
        this.logger.debug(`Suche abgeschlossen: ${items.length} Ergebnisse von insgesamt ${total}`, 'SearchService');
        return {
            items,
            total,
            page,
            pageSize: limit,
            totalPages,
        };
    }
    async suggest(query, limit = 5) {
        if (!query || query.length < 2) {
            return [];
        }
        this.logger.debug(`Starte Vorschläge für Query: ${query}`, 'SearchService');
        const titles = await this.mediaRepository.find({
            select: ['title'],
            where: { title: (0, typeorm_2.ILike)(`${query}%`) },
            take: limit,
        });
        const genreResults = await this.mediaRepository
            .createQueryBuilder('media')
            .select('unnest(media.genres)', 'genre')
            .where('unnest(media.genres) ILIKE :query', { query: `${query}%` })
            .groupBy('genre')
            .take(limit)
            .getRawMany();
        const genres = genreResults.map(result => result.genre);
        const suggestions = [
            ...titles.map(item => item.title),
            ...genres,
        ];
        return [...new Set(suggestions)].slice(0, limit);
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        logger_service_1.LoggerService])
], SearchService);
//# sourceMappingURL=search.service.js.map