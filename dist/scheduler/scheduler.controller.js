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
exports.SchedulerController = void 0;
const common_1 = require("@nestjs/common");
const scheduler_service_1 = require("./scheduler.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const logger_service_1 = require("../shared/services/logger.service");
const swagger_1 = require("@nestjs/swagger");
let SchedulerController = class SchedulerController {
    constructor(schedulerService, logger) {
        this.schedulerService = schedulerService;
        this.logger = logger;
    }
    getScheduledJobs() {
        this.logger.debug('Rufe geplante Jobs ab', 'SchedulerController');
        return this.schedulerService.getScheduledJobs();
    }
    async scheduleLibraryScan(id, scheduleOptions) {
        this.logger.debug(`Plane Scan für Bibliothek ${id} ${(scheduleOptions === null || scheduleOptions === void 0 ? void 0 : scheduleOptions.cronExpression) ? `(${scheduleOptions.cronExpression})` : ''}`, 'SchedulerController');
        const success = await this.schedulerService.scheduleLibraryScan(id, scheduleOptions === null || scheduleOptions === void 0 ? void 0 : scheduleOptions.cronExpression);
        return {
            message: success
                ? 'Scan erfolgreich geplant'
                : 'Scan konnte nicht geplant werden',
            success,
        };
    }
    async triggerLibraryScan(id) {
        this.logger.debug(`Manueller Scan für Bibliothek ${id} ausgelöst`, 'SchedulerController');
        await this.schedulerService.scanLibrary(id);
        return { message: 'Scan gestartet' };
    }
};
exports.SchedulerController = SchedulerController;
__decorate([
    (0, common_1.Get)('jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Alle geplanten Jobs abrufen' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste aller geplanten Jobs',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                    name: { type: 'string', example: 'Bibliothek scannen' },
                    type: { type: 'string', example: 'library-scan' },
                    schedule: { type: 'string', example: '0 0 * * *' },
                    enabled: { type: 'boolean', example: true },
                    lastRun: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-03-10T12:00:00Z',
                        nullable: true
                    },
                    nextRun: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-03-11T00:00:00Z'
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "getScheduledJobs", null);
__decorate([
    (0, common_1.Post)('library/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Bibliotheksscan planen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Bibliothek', type: 'string' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                cronExpression: {
                    type: 'string',
                    example: '0 0 * * *',
                    description: 'Cron-Ausdruck für die Planung (optional)'
                }
            },
            required: []
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Scan erfolgreich geplant',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Scan erfolgreich geplant' },
                success: { type: 'boolean', example: true }
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
], SchedulerController.prototype, "scheduleLibraryScan", null);
__decorate([
    (0, common_1.Post)('scan/library/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Manuellen Bibliotheksscan auslösen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID der Bibliothek', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Scan gestartet',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Scan gestartet' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bibliothek nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchedulerController.prototype, "triggerLibraryScan", null);
exports.SchedulerController = SchedulerController = __decorate([
    (0, swagger_1.ApiTags)('Scheduler'),
    (0, common_1.Controller)('scheduler'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [scheduler_service_1.SchedulerService,
        logger_service_1.LoggerService])
], SchedulerController);
//# sourceMappingURL=scheduler.controller.js.map