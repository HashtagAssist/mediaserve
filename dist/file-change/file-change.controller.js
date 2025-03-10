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
    async findAll(limit, offset, type, status) {
        this.logger.debug(`Rufe Dateiänderungen ab: limit=${limit}, offset=${offset}, type=${type}, status=${status}`, 'FileChangeController');
        return this.fileChangeService.findAll(limit, offset, type, status);
    }
    async processChanges(body) {
        this.logger.debug(`Verarbeite Dateiänderungen${body.libraryId ? ` für Bibliothek ${body.libraryId}` : ''}`, 'FileChangeController');
        const result = await this.fileChangeService.processChanges(body.libraryId);
        return Object.assign({ message: 'Dateiänderungen erfolgreich verarbeitet' }, result);
    }
};
exports.FileChangeController = FileChangeController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Dateiänderungen abrufen',
        description: 'Ruft eine Liste von Dateiänderungen mit Paginierung ab'
    }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Anzahl der Ergebnisse pro Seite', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, description: 'Seitenversatz für Paginierung', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, description: 'Typ der Änderung (added, modified, deleted)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Status der Änderung (pending, processed, failed)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste der Dateiänderungen',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number', example: 42 },
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                            path: { type: 'string', example: '/pfad/zur/datei.mp4' },
                            type: { type: 'string', example: 'added' },
                            status: { type: 'string', example: 'pending' },
                            libraryId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
                            createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    __param(0, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], FileChangeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('process'),
    (0, swagger_1.ApiOperation)({
        summary: 'Dateiänderungen verarbeiten',
        description: 'Verarbeitet ausstehende Dateiänderungen'
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                libraryId: {
                    type: 'string',
                    example: '550e8400-e29b-41d4-a716-446655440000',
                    description: 'Optional: Nur Änderungen für eine bestimmte Bibliothek verarbeiten'
                }
            },
            required: []
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dateiänderungen erfolgreich verarbeitet',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Dateiänderungen erfolgreich verarbeitet' },
                processed: { type: 'number', example: 5 },
                failed: { type: 'number', example: 0 }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileChangeController.prototype, "processChanges", null);
exports.FileChangeController = FileChangeController = __decorate([
    (0, swagger_1.ApiTags)('Dateiänderungen'),
    (0, common_1.Controller)('file-changes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [file_change_service_1.FileChangeService,
        logger_service_1.LoggerService])
], FileChangeController);
//# sourceMappingURL=file-change.controller.js.map