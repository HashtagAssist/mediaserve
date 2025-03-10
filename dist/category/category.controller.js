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
    create(createCategoryDto) {
        this.logger.debug(`Erstelle neue Kategorie: ${createCategoryDto.name}`, 'CategoryController');
        return this.categoryService.create(createCategoryDto);
    }
    findAll() {
        this.logger.debug('Abrufen aller Kategorien', 'CategoryController');
        return this.categoryService.findAll();
    }
    findOne(id) {
        this.logger.debug(`Abrufen der Kategorie mit ID: ${id}`, 'CategoryController');
        return this.categoryService.findOne(id);
    }
    update(id, updateCategoryDto) {
        this.logger.debug(`Aktualisiere Kategorie mit ID: ${id}`, 'CategoryController');
        return this.categoryService.update(id, updateCategoryDto);
    }
    remove(id) {
        this.logger.debug(`Lösche Kategorie mit ID: ${id}`, 'CategoryController');
        return this.categoryService.remove(id);
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
    categorizeMedia(id) {
        this.logger.debug(`Kategorisiere Medium mit ID: ${id}`, 'CategoryController');
        return this.categoryService.categorizeMedia(id);
    }
};
exports.CategoryController = CategoryController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Neue Kategorie erstellen' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Kategorie wurde erstellt',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                description: { type: 'string', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
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
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CategoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Kategorie nach ID abrufen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Kategorie-ID', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Kategorie gefunden',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                description: { type: 'string', nullable: true },
                media: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            title: { type: 'string' },
                        }
                    }
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kategorie nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Kategorie aktualisieren' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Kategorie-ID', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Kategorie wurde aktualisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kategorie nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_category_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", void 0)
], CategoryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Kategorie löschen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Kategorie-ID', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Kategorie wurde gelöscht' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kategorie nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
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
__decorate([
    (0, common_1.Post)('media/:id/categorize'),
    (0, swagger_1.ApiOperation)({ summary: 'Medium automatisch kategorisieren' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Medien-ID', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Medium wurde kategorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medium nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoryController.prototype, "categorizeMedia", null);
exports.CategoryController = CategoryController = __decorate([
    (0, swagger_1.ApiTags)('Categories'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('categories'),
    __metadata("design:paramtypes", [category_service_1.CategoryService,
        logger_service_1.LoggerService])
], CategoryController);
//# sourceMappingURL=category.controller.js.map