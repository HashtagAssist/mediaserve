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
exports.RatingController = void 0;
const common_1 = require("@nestjs/common");
const rating_service_1 = require("./rating.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const logger_service_1 = require("../shared/services/logger.service");
const create_rating_dto_1 = require("./dto/create-rating.dto");
const swagger_1 = require("@nestjs/swagger");
let RatingController = class RatingController {
    constructor(ratingService, logger) {
        this.ratingService = ratingService;
        this.logger = logger;
    }
    async rateMedia(mediaId, createRatingDto, req) {
        this.logger.debug(`Bewerte Medium ${mediaId} mit ${createRatingDto.value} Sternen`, 'RatingController');
        const userId = req.user.id;
        return this.ratingService.rateMedia(userId, mediaId, createRatingDto);
    }
    async getMediaRatings(mediaId, req) {
        this.logger.debug(`Rufe Bewertungen für Medium ${mediaId} ab`, 'RatingController');
        const userId = req.user.id;
        return this.ratingService.getMediaRatings(mediaId);
    }
    async deleteRating(mediaId, req) {
        this.logger.debug(`Lösche Bewertung für Medium ${mediaId}`, 'RatingController');
        const userId = req.user.id;
        await this.ratingService.deleteRating(userId, mediaId);
        return { message: 'Bewertung erfolgreich gelöscht' };
    }
    async getUserRatings(req) {
        this.logger.debug('Rufe alle Bewertungen des Benutzers ab', 'RatingController');
        const userId = req.user.id;
        return this.ratingService.getUserRatings(userId);
    }
};
exports.RatingController = RatingController;
__decorate([
    (0, common_1.Post)('media/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Medium bewerten' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiBody)({
        type: create_rating_dto_1.CreateRatingDto,
        examples: {
            'Medium bewerten': {
                value: {
                    rating: 4,
                    comment: 'Ein sehr guter Film!'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Bewertung erfolgreich erstellt',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
                mediaId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
                rating: { type: 'number', example: 4 },
                comment: { type: 'string', example: 'Ein sehr guter Film!' },
                createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Ungültige Daten' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medium nicht gefunden' }),
    __param(0, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_rating_dto_1.CreateRatingDto, Object]),
    __metadata("design:returntype", Promise)
], RatingController.prototype, "rateMedia", null);
__decorate([
    (0, common_1.Get)('media/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Bewertungen für ein Medium abrufen' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste der Bewertungen für das Medium',
        schema: {
            type: 'object',
            properties: {
                averageRating: { type: 'number', example: 4.2 },
                totalRatings: { type: 'number', example: 15 },
                userRating: {
                    type: 'object',
                    nullable: true,
                    properties: {
                        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                        rating: { type: 'number', example: 4 },
                        comment: { type: 'string', example: 'Ein sehr guter Film!' },
                        createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
                    }
                },
                ratings: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                            rating: { type: 'number', example: 4 },
                            comment: { type: 'string', example: 'Ein sehr guter Film!' },
                            user: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
                                    username: { type: 'string', example: 'benutzer123' }
                                }
                            },
                            createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medium nicht gefunden' }),
    __param(0, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RatingController.prototype, "getMediaRatings", null);
__decorate([
    (0, common_1.Delete)('media/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Eigene Bewertung für ein Medium löschen' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bewertung erfolgreich gelöscht',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Bewertung erfolgreich gelöscht' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bewertung nicht gefunden' }),
    __param(0, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RatingController.prototype, "deleteRating", null);
__decorate([
    (0, common_1.Get)('user'),
    (0, swagger_1.ApiOperation)({ summary: 'Alle eigenen Bewertungen abrufen' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste aller eigenen Bewertungen',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                    rating: { type: 'number', example: 4 },
                    comment: { type: 'string', example: 'Ein sehr guter Film!' },
                    media: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
                            title: { type: 'string', example: 'Beispielvideo' },
                            thumbnailPath: { type: 'string', example: '/pfad/zum/thumbnail.jpg' },
                            type: { type: 'string', example: 'movie' }
                        }
                    },
                    createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RatingController.prototype, "getUserRatings", null);
exports.RatingController = RatingController = __decorate([
    (0, swagger_1.ApiTags)('Bewertungen'),
    (0, common_1.Controller)('ratings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [rating_service_1.RatingService,
        logger_service_1.LoggerService])
], RatingController);
//# sourceMappingURL=rating.controller.js.map