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
exports.LibraryController = void 0;
const common_1 = require("@nestjs/common");
const library_service_1 = require("./library.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const logger_service_1 = require("../shared/services/logger.service");
const create_library_dto_1 = require("./dto/create-library.dto");
const update_library_dto_1 = require("./dto/update-library.dto");
const library_entity_1 = require("./entities/library.entity");
const swagger_1 = require("@nestjs/swagger");
let LibraryController = class LibraryController {
    constructor(libraryService, logger) {
        this.libraryService = libraryService;
        this.logger = logger;
    }
    async create(createLibraryDto) {
        this.logger.debug(`Erstelle neue Bibliothek: ${createLibraryDto.name}`, 'LibraryController');
        return await this.libraryService.create(createLibraryDto);
    }
    async findAll() {
        this.logger.debug('Rufe alle Bibliotheken ab', 'LibraryController');
        return await this.libraryService.findAll();
    }
    async findOne(id) {
        this.logger.debug(`Rufe Bibliothek ab: ${id}`, 'LibraryController');
        return await this.libraryService.findOne(id);
    }
    async update(id, updateLibraryDto) {
        this.logger.debug(`Aktualisiere Bibliothek: ${id}`, 'LibraryController');
        return await this.libraryService.update(id, updateLibraryDto);
    }
    async scan(id, scanOptions) {
        this.logger.debug(`Starte Scan für Bibliothek: ${id} ${(scanOptions === null || scanOptions === void 0 ? void 0 : scanOptions.recursive) !== false ? '(rekursiv)' : ''} ${(scanOptions === null || scanOptions === void 0 ? void 0 : scanOptions.incrementalScan) ? '(inkrementell)' : ''}`, 'LibraryController');
        await this.libraryService.scanLibrary(id, scanOptions);
        return { message: 'Scan erfolgreich gestartet' };
    }
    async remove(id) {
        this.logger.debug(`Lösche Bibliothek: ${id}`, 'LibraryController');
        await this.libraryService.remove(id);
        return { message: 'Bibliothek erfolgreich gelöscht' };
    }
    async getStats(id) {
        this.logger.debug(`Rufe Statistiken für Bibliothek ab: ${id}`, 'LibraryController');
        return await this.libraryService.getStats(id);
    }
};
exports.LibraryController = LibraryController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Neue Bibliothek erstellen' }),
    (0, swagger_1.ApiBody)({
        type: create_library_dto_1.CreateLibraryDto,
        examples: {
            'Neue Film-Bibliothek': {
                value: {
                    name: 'Meine Filme',
                    path: '/pfad/zu/filmen',
                    autoScan: true,
                    scanSchedule: '0 0 * * *'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Bibliothek wurde erstellt',
        type: library_entity_1.Library
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Ungültige Daten' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_library_dto_1.CreateLibraryDto]),
    __metadata("design:returntype", Promise)
], LibraryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Alle Bibliotheken abrufen' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste aller Bibliotheken',
        type: [library_entity_1.Library]
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LibraryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eine Bibliothek abrufen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Bibliothek', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Die gefundene Bibliothek',
        type: library_entity_1.Library
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bibliothek nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LibraryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Bibliothek aktualisieren' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Bibliothek', type: 'string' }),
    (0, swagger_1.ApiBody)({ type: update_library_dto_1.UpdateLibraryDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Aktualisierte Bibliothek',
        type: library_entity_1.Library
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bibliothek nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_library_dto_1.UpdateLibraryDto]),
    __metadata("design:returntype", Promise)
], LibraryController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/scan'),
    (0, swagger_1.ApiOperation)({
        summary: 'Bibliothek scannen',
        description: 'Startet einen Scan der Bibliothek nach neuen oder geänderten Medien'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Bibliothek', type: 'string' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                recursive: { type: 'boolean', default: true, description: 'Unterverzeichnisse durchsuchen' },
                maxDepth: { type: 'number', description: 'Maximale Tiefe für rekursive Suche' },
                incrementalScan: { type: 'boolean', default: false, description: 'Nur neue/geänderte Dateien scannen' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Scan erfolgreich gestartet',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Scan erfolgreich gestartet' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bibliothek nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LibraryController.prototype, "scan", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Bibliothek löschen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Bibliothek', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bibliothek erfolgreich gelöscht',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Bibliothek erfolgreich gelöscht' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bibliothek nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LibraryController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Bibliotheksstatistiken abrufen',
        description: 'Ruft Statistiken über die Medien in der Bibliothek ab'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Bibliothek', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bibliotheksstatistiken',
        schema: {
            type: 'object',
            properties: {
                totalMedia: { type: 'number', example: 123 },
                mediaByType: {
                    type: 'object',
                    example: { movie: 50, music: 73 }
                },
                totalSize: { type: 'number', example: 1073741824 },
                averageDuration: { type: 'number', example: 5400 }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bibliothek nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LibraryController.prototype, "getStats", null);
exports.LibraryController = LibraryController = __decorate([
    (0, common_1.Controller)('libraries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [library_service_1.LibraryService,
        logger_service_1.LoggerService])
], LibraryController);
//# sourceMappingURL=library.controller.js.map