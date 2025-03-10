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
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const search_service_1 = require("./search.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const logger_service_1 = require("../shared/services/logger.service");
const swagger_1 = require("@nestjs/swagger");
const media_type_enum_1 = require("../media/enums/media-type.enum");
let SearchController = class SearchController {
    constructor(searchService, logger) {
        this.searchService = searchService;
        this.logger = logger;
    }
    async search(query, type, genres, yearMin, yearMax, durationMin, durationMax, libraryId, limit, offset, sortBy, sortOrder) {
        this.logger.debug(`Suche mit Query: ${query || 'keine'}`, 'SearchController');
        const options = {
            query,
            limit,
            offset,
            sortBy,
            sortOrder: sortOrder === 'DESC' ? 'DESC' : 'ASC',
        };
        if (type) {
            options.type = type.includes(',') ? type.split(',') : type;
        }
        if (genres) {
            options.genres = genres.split(',');
        }
        if (yearMin > 0 || yearMax > 0) {
            options.year = {};
            if (yearMin > 0)
                options.year.min = yearMin;
            if (yearMax > 0)
                options.year.max = yearMax;
        }
        if (durationMin > 0 || durationMax > 0) {
            options.duration = {};
            if (durationMin > 0)
                options.duration.min = durationMin;
            if (durationMax > 0)
                options.duration.max = durationMax;
        }
        if (libraryId) {
            options.libraryId = libraryId;
        }
        return await this.searchService.search(options);
    }
    async suggest(query, limit) {
        this.logger.debug(`Vorschlagsanfrage erhalten: ${query}`, 'SearchController');
        return await this.searchService.suggest(query, limit);
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Mediensuche',
        description: 'Durchsucht Medien nach verschiedenen Kriterien mit Paginierung und Filtern.'
    }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: false, description: 'Suchbegriff' }),
    (0, swagger_1.ApiQuery)({ name: 'type', enum: media_type_enum_1.MediaType, required: false, description: 'Medientyp-Filter' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Anzahl der Ergebnisse pro Seite', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, description: 'Seitenversatz für Paginierung', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'genres', required: false, description: 'Nach Genres filtern (kommagetrennt)', type: String }),
    (0, swagger_1.ApiQuery)({ name: 'yearMin', required: false, description: 'Mindestjahr', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'yearMax', required: false, description: 'Maximaljahr', type: Number }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Suchergebnisse',
        schema: {
            type: 'object',
            properties: {
                results: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                            title: { type: 'string', example: 'Beispielvideo' },
                            type: { type: 'string', example: 'movie' },
                            description: { type: 'string', example: 'Eine Beschreibung des Videos' },
                            thumbnailPath: { type: 'string', example: '/pfad/zu/thumbnail.jpg' }
                        }
                    }
                },
                pagination: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 42 },
                        limit: { type: 'number', example: 20 },
                        offset: { type: 'number', example: 0 },
                        pages: { type: 'number', example: 3 }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('genres')),
    __param(3, (0, common_1.Query)('yearMin', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(4, (0, common_1.Query)('yearMax', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(5, (0, common_1.Query)('durationMin', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(6, (0, common_1.Query)('durationMax', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(7, (0, common_1.Query)('libraryId')),
    __param(8, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(9, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(10, (0, common_1.Query)('sortBy', new common_1.DefaultValuePipe('title'))),
    __param(11, (0, common_1.Query)('sortOrder', new common_1.DefaultValuePipe('ASC'))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number, Number, Number, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('suggest'),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(5), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "suggest", null);
exports.SearchController = SearchController = __decorate([
    (0, swagger_1.ApiTags)('Suche'),
    (0, common_1.Controller)('search'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [search_service_1.SearchService,
        logger_service_1.LoggerService])
], SearchController);
//# sourceMappingURL=search.controller.js.map