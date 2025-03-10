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
exports.FileChangeController = void 0;
const common_1 = require("@nestjs/common");
const file_change_service_1 = require("./file-change.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const logger_service_1 = require("../shared/services/logger.service");
const swagger_1 = require("@nestjs/swagger");
let FileChangeController = class FileChangeController {
    constructor(fileChangeService, logger) {
        this.fileChangeService = fileChangeService;
        this.logger = logger;
    }
    findAll(status, type) {
        this.logger.debug('Abrufen aller Dateiänderungen', 'FileChangeController');
        return this.fileChangeService.findAll(status, type);
    }
    findOne(id) {
        this.logger.debug(`Abrufen der Dateiänderung mit ID: ${id}`, 'FileChangeController');
        return this.fileChangeService.findOne(id);
    }
    detectChanges(id) {
        this.logger.debug(`Erkennen von Dateiänderungen für Bibliothek ${id}`, 'FileChangeController');
        return this.fileChangeService.detectChangesForLibrary(id);
    }
    process(id) {
        this.logger.debug(`Verarbeiten der Dateiänderung mit ID: ${id}`, 'FileChangeController');
        return this.fileChangeService.processChange(id);
    }
};
exports.FileChangeController = FileChangeController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Alle Dateiänderungen abrufen' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['pending', 'processed', 'failed'] }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['added', 'modified', 'deleted'] }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste aller Dateiänderungen',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    path: { type: 'string' },
                    type: { type: 'string', enum: ['added', 'modified', 'deleted'] },
                    status: { type: 'string', enum: ['pending', 'processed', 'failed'] },
                    errorMessage: { type: 'string', nullable: true },
                    library: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            name: { type: 'string' },
                        }
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                }
            }
        }
    }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FileChangeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Dateiänderung nach ID abrufen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dateiänderungs-ID', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dateiänderung gefunden',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                path: { type: 'string' },
                type: { type: 'string', enum: ['added', 'modified', 'deleted'] },
                status: { type: 'string', enum: ['pending', 'processed', 'failed'] },
                errorMessage: { type: 'string', nullable: true },
                library: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        path: { type: 'string' },
                    }
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dateiänderung nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FileChangeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('libraries/:id/detect'),
    (0, swagger_1.ApiOperation)({ summary: 'Dateiänderungen für eine Bibliothek erkennen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Bibliotheks-ID', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Erkannte Änderungen',
        schema: {
            type: 'object',
            properties: {
                added: { type: 'array', items: { type: 'string' } },
                modified: { type: 'array', items: { type: 'string' } },
                deleted: { type: 'array', items: { type: 'string' } },
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bibliothek nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FileChangeController.prototype, "detectChanges", null);
__decorate([
    (0, common_1.Post)(':id/process'),
    (0, swagger_1.ApiOperation)({ summary: 'Dateiänderung verarbeiten' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dateiänderungs-ID', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dateiänderung wurde verarbeitet' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dateiänderung nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FileChangeController.prototype, "process", null);
exports.FileChangeController = FileChangeController = __decorate([
    (0, swagger_1.ApiTags)('File Changes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('file-changes'),
    __metadata("design:paramtypes", [file_change_service_1.FileChangeService,
        logger_service_1.LoggerService])
], FileChangeController);
//# sourceMappingURL=file-change.controller.js.map