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
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const media_entity_1 = require("../media/entities/media.entity");
const logger_service_1 = require("../shared/services/logger.service");
const path = require("path");
const category_entity_1 = require("./entities/category.entity");
let CategoryService = class CategoryService {
    constructor(categoryRepository, mediaRepository, logger) {
        this.categoryRepository = categoryRepository;
        this.mediaRepository = mediaRepository;
        this.logger = logger;
        this.movieGenreRules = [
            { name: 'Action', pattern: /\b(action|kampf|explosion|thriller)\b/i, priority: 1 },
            { name: 'Comedy', pattern: /\b(comedy|komödie|lustig|humor)\b/i, priority: 1 },
            { name: 'Drama', pattern: /\b(drama|emotional|tragödie)\b/i, priority: 1 },
            { name: 'Horror', pattern: /\b(horror|grusel|schocker|angst)\b/i, priority: 1 },
            { name: 'Sci-Fi', pattern: /\b(sci-?fi|science.?fiction|zukunft|space|weltraum)\b/i, priority: 1 },
            { name: 'Fantasy', pattern: /\b(fantasy|magie|zauberer|drachen|elfen)\b/i, priority: 1 },
            { name: 'Documentary', pattern: /\b(doku|dokumentation|documentary)\b/i, priority: 2 },
            { name: 'Animation', pattern: /\b(animation|animiert|cartoon|anime)\b/i, priority: 2 },
            { name: 'Family', pattern: /\b(family|familie|kinder|jugend)\b/i, priority: 1 },
        ];
        this.musicGenreRules = [
            { name: 'Rock', pattern: /\b(rock|metal|punk|grunge)\b/i, priority: 1 },
            { name: 'Pop', pattern: /\b(pop|charts|mainstream)\b/i, priority: 1 },
            { name: 'Electronic', pattern: /\b(electro|electronic|techno|house|edm|trance)\b/i, priority: 1 },
            { name: 'Hip-Hop', pattern: /\b(hip.?hop|rap|r&b)\b/i, priority: 1 },
            { name: 'Jazz', pattern: /\b(jazz|blues|swing)\b/i, priority: 1 },
            { name: 'Classical', pattern: /\b(klassik|classical|orchestra|symphonie)\b/i, priority: 1 },
        ];
    }
    async create(createCategoryDto) {
        this.logger.debug(`Erstelle neue Kategorie: ${createCategoryDto.name}`, 'CategoryService');
        const category = this.categoryRepository.create(createCategoryDto);
        return this.categoryRepository.save(category);
    }
    async findAll() {
        this.logger.debug('Rufe alle Kategorien ab', 'CategoryService');
        return this.categoryRepository.find();
    }
    async findOne(id) {
        this.logger.debug(`Rufe Kategorie ab: ${id}`, 'CategoryService');
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['media'],
        });
        if (!category) {
            this.logger.warn(`Kategorie ${id} nicht gefunden`, 'CategoryService');
            throw new common_1.NotFoundException(`Kategorie mit ID ${id} nicht gefunden`);
        }
        return category;
    }
    async update(id, updateCategoryDto) {
        this.logger.debug(`Aktualisiere Kategorie: ${id}`, 'CategoryService');
        const category = await this.findOne(id);
        Object.assign(category, updateCategoryDto);
        return this.categoryRepository.save(category);
    }
    async remove(id) {
        this.logger.debug(`Lösche Kategorie: ${id}`, 'CategoryService');
        const category = await this.findOne(id);
        await this.categoryRepository.remove(category);
    }
    async addMedia(categoryId, mediaId) {
        this.logger.debug(`Füge Medium ${mediaId} zur Kategorie ${categoryId} hinzu`, 'CategoryService');
        const category = await this.findOne(categoryId);
        const media = await this.mediaRepository.findOne({
            where: { id: mediaId },
        });
        if (!media) {
            this.logger.warn(`Medium ${mediaId} nicht gefunden`, 'CategoryService');
            throw new common_1.NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
        }
        if (!category.media) {
            category.media = [];
        }
        category.media.push(media);
        await this.categoryRepository.save(category);
    }
    async removeMedia(categoryId, mediaId) {
        this.logger.debug(`Entferne Medium ${mediaId} aus Kategorie ${categoryId}`, 'CategoryService');
        const category = await this.findOne(categoryId);
        if (!category.media) {
            return;
        }
        category.media = category.media.filter(media => media.id !== mediaId);
        await this.categoryRepository.save(category);
    }
    async categorizeMedia(mediaId) {
        const media = await this.mediaRepository.findOne({ where: { id: mediaId } });
        if (!media) {
            this.logger.warn(`Medium mit ID ${mediaId} nicht gefunden`, 'CategoryService');
            return [];
        }
        this.logger.debug(`Kategorisiere Medium: ${media.title}`, 'CategoryService');
        const genres = this.detectGenres(media);
        if (genres.length > 0) {
            media.genres = genres;
            await this.mediaRepository.save(media);
            this.logger.debug(`Medium ${media.title} kategorisiert als: ${genres.join(', ')}`, 'CategoryService');
        }
        else {
            this.logger.debug(`Keine Kategorien für Medium ${media.title} gefunden`, 'CategoryService');
        }
        return genres;
    }
    async categorizeLibrary(libraryId) {
        const media = await this.mediaRepository.find({
            where: {
                library: { id: libraryId },
                genres: null,
            },
        });
        this.logger.debug(`Starte Kategorisierung für ${media.length} Medien in Bibliothek ${libraryId}`, 'CategoryService');
        let categorizedCount = 0;
        for (const item of media) {
            const genres = await this.categorizeMedia(item.id);
            if (genres.length > 0) {
                categorizedCount++;
            }
        }
        this.logger.debug(`Kategorisierung abgeschlossen: ${categorizedCount}/${media.length} erfolgreich`, 'CategoryService');
        return categorizedCount;
    }
    detectGenres(media) {
        const genres = new Set();
        const rules = media.type === 'movie' ? this.movieGenreRules : this.musicGenreRules;
        this.analyzeText(media.title, rules, genres);
        if (media.relativePath) {
            const pathParts = media.relativePath.split(path.sep);
            for (const part of pathParts) {
                this.analyzeText(part, rules, genres);
            }
        }
        if (media.description) {
            this.analyzeText(media.description, rules, genres);
        }
        return Array.from(genres);
    }
    analyzeText(text, rules, genres) {
        for (const rule of rules) {
            if (rule.pattern.test(text)) {
                genres.add(rule.name);
            }
        }
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(1, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        logger_service_1.LoggerService])
], CategoryService);
//# sourceMappingURL=category.service.js.map