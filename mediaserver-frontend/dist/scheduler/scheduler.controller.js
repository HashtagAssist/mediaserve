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
    async getJobs() {
        this.logger.debug('Abrufen aller geplanten Jobs', 'SchedulerController');
        return this.schedulerService.getJobs();
    }
    async runJob(id) {
        this.logger.debug(`Manuelles Ausführen des Jobs ${id}`, 'SchedulerController');
        await this.schedulerService.runJob(id);
        return { message: 'Job gestartet' };
    }
    async triggerLibraryScan(id) {
        this.logger.debug(`Manueller Scan für Bibliothek ${id} ausgelöst`, 'SchedulerController');
        await this.schedulerService.scanLibrary(id);
        return { message: 'Scan gestartet' };
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
                    id: { type: 'string' },
                    name: { type: 'string' },
                    nextRun: { type: 'string', format: 'date-time' },
                    lastRun: { type: 'string', format: 'date-time', nullable: true },
                    status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed'] },
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerController.prototype, "getJobs", null);
__decorate([
    (0, common_1.Post)('jobs/:id/run'),
    (0, swagger_1.ApiOperation)({ summary: 'Job manuell ausführen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Job-ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Job wurde gestartet' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchedulerController.prototype, "runJob", null);
__decorate([
    (0, common_1.Post)('libraries/:id/scan'),
    (0, swagger_1.ApiOperation)({ summary: 'Bibliotheksscan manuell auslösen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Bibliotheks-ID', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scan wurde gestartet' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bibliothek nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchedulerController.prototype, "triggerLibraryScan", null);
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
exports.SchedulerController = SchedulerController = __decorate([
    (0, swagger_1.ApiTags)('Scheduler'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('scheduler'),
    __metadata("design:paramtypes", [scheduler_service_1.SchedulerService,
        logger_service_1.LoggerService])
], SchedulerController);
//# sourceMappingURL=scheduler.controller.js.map