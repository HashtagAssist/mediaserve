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
exports.CategoryController = void 0;
const common_1 = require("@nestjs/common");
const category_service_1 = require("./category.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const logger_service_1 = require("../shared/services/logger.service");
const create_category_dto_1 = require("./dto/create-category.dto");
const update_category_dto_1 = require("./dto/update-category.dto");
const swagger_1 = require("@nestjs/swagger");
let CategoryController = class CategoryController {
    constructor(categoryService, logger) {
        this.categoryService = categoryService;
        this.logger = logger;
    }
    async create(createCategoryDto) {
        this.logger.debug(`Erstelle neue Kategorie: ${createCategoryDto.name}`, 'CategoryController');
        return this.categoryService.create(createCategoryDto);
    }
    async findAll() {
        this.logger.debug('Rufe alle Kategorien ab', 'CategoryController');
        return this.categoryService.findAll();
    }
    async findOne(id) {
        this.logger.debug(`Rufe Kategorie ab: ${id}`, 'CategoryController');
        return this.categoryService.findOne(id);
    }
    async update(id, updateCategoryDto) {
        this.logger.debug(`Aktualisiere Kategorie: ${id}`, 'CategoryController');
        return this.categoryService.update(id, updateCategoryDto);
    }
    async remove(id) {
        this.logger.debug(`Lösche Kategorie: ${id}`, 'CategoryController');
        await this.categoryService.remove(id);
        return { message: 'Kategorie erfolgreich gelöscht' };
    }
    async addMedia(id, mediaId) {
        this.logger.debug(`Füge Medium ${mediaId} zur Kategorie ${id} hinzu`, 'CategoryController');
        await this.categoryService.addMedia(id, mediaId);
        return { message: 'Medium erfolgreich zur Kategorie hinzugefügt' };
    }
    async removeMedia(id, mediaId) {
        this.logger.debug(`Entferne Medium ${mediaId} aus Kategorie ${id}`, 'CategoryController');
        await this.categoryService.removeMedia(id, mediaId);
        return { message: 'Medium erfolgreich aus Kategorie entfernt' };
    }
};
exports.CategoryController = CategoryController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Neue Kategorie erstellen' }),
    (0, swagger_1.ApiBody)({
        type: create_category_dto_1.CreateCategoryDto,
        examples: {
            'Neue Kategorie': {
                value: {
                    name: 'Action',
                    description: 'Actionfilme und -serien'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Kategorie erfolgreich erstellt',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                name: { type: 'string', example: 'Action' },
                description: { type: 'string', example: 'Actionfilme und -serien' },
                createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Ungültige Daten' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Alle Kategorien abrufen' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste aller Kategorien',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                    name: { type: 'string', example: 'Action' },
                    description: { type: 'string', example: 'Actionfilme und -serien' },
                    mediaCount: { type: 'number', example: 42 },
                    createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eine Kategorie abrufen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Kategorie', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Die gefundene Kategorie',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                name: { type: 'string', example: 'Action' },
                description: { type: 'string', example: 'Actionfilme und -serien' },
                media: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
                            title: { type: 'string', example: 'Beispielfilm' },
                            thumbnailPath: { type: 'string', example: '/pfad/zum/thumbnail.jpg' }
                        }
                    }
                },
                createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kategorie nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Kategorie aktualisieren' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Kategorie', type: 'string' }),
    (0, swagger_1.ApiBody)({
        type: update_category_dto_1.UpdateCategoryDto,
        examples: {
            'Kategorie aktualisieren': {
                value: {
                    name: 'Action & Abenteuer',
                    description: 'Action- und Abenteuerfilme'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Kategorie erfolgreich aktualisiert',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                name: { type: 'string', example: 'Action & Abenteuer' },
                description: { type: 'string', example: 'Action- und Abenteuerfilme' },
                updatedAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Ungültige Daten' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kategorie nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_category_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Kategorie löschen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Kategorie', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Kategorie erfolgreich gelöscht',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Kategorie erfolgreich gelöscht' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kategorie nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/media/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Medium zu Kategorie hinzufügen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Kategorie', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Medium erfolgreich zur Kategorie hinzugefügt',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Medium erfolgreich zur Kategorie hinzugefügt' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kategorie oder Medium nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "addMedia", null);
__decorate([
    (0, common_1.Delete)(':id/media/:mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Medium aus Kategorie entfernen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Kategorie', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ID des Mediums', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Medium erfolgreich aus Kategorie entfernt',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Medium erfolgreich aus Kategorie entfernt' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kategorie oder Medium nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "removeMedia", null);
exports.CategoryController = CategoryController = __decorate([
    (0, swagger_1.ApiTags)('Kategorien'),
    (0, common_1.Controller)('categories'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [category_service_1.CategoryService,
        logger_service_1.LoggerService])
], CategoryController);
//# sourceMappingURL=category.controller.js.map