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
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const library_entity_1 = require("../library/entities/library.entity");
const library_service_1 = require("../library/library.service");
const logger_service_1 = require("../shared/services/logger.service");
const config_1 = require("@nestjs/config");
const cron_1 = require("cron");
let SchedulerService = class SchedulerService {
    constructor(libraryRepository, libraryService, schedulerRegistry, logger, configService) {
        this.libraryRepository = libraryRepository;
        this.libraryService = libraryService;
        this.schedulerRegistry = schedulerRegistry;
        this.logger = logger;
        this.configService = configService;
        this.scanningLibraries = new Set();
        this.scheduledJobs = new Map();
    }
    async onModuleInit() {
        await this.setupScheduledJobs();
    }
    async setupScheduledJobs() {
        const libraries = await this.libraryRepository.find({
            where: { autoScan: true },
        });
        this.logger.debug(`Initialisiere Scheduler für ${libraries.length} Bibliotheken mit autoScan`, 'SchedulerService');
        for (const library of libraries) {
            await this.scheduleLibraryScan(library.id);
        }
    }
    async scheduleLibraryScan(libraryId, cronExpression) {
        const library = await this.libraryRepository.findOne({ where: { id: libraryId } });
        if (!library) {
            this.logger.warn(`Bibliothek ${libraryId} nicht gefunden`, 'SchedulerService');
            return false;
        }
        if (this.scheduledJobs.has(libraryId)) {
            const jobName = this.scheduledJobs.get(libraryId);
            try {
                this.schedulerRegistry.deleteCronJob(jobName);
                this.scheduledJobs.delete(libraryId);
                this.logger.debug(`Bestehender Scan-Job für Bibliothek ${libraryId} entfernt`, 'SchedulerService');
            }
            catch (error) {
                this.logger.error(`Fehler beim Entfernen des bestehenden Jobs: ${error.message}`, error.stack, 'SchedulerService');
            }
        }
        if (!library.autoScan && !cronExpression) {
            this.logger.debug(`Kein Scan-Job für Bibliothek ${libraryId} geplant (autoScan deaktiviert)`, 'SchedulerService');
            return false;
        }
        const cron = cronExpression || this.configService.get('DEFAULT_SCAN_SCHEDULE', schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT);
        const jobName = `library-scan-${libraryId}`;
        const job = new cron_1.CronJob(cron, () => {
            this.scanLibrary(libraryId);
        });
        this.schedulerRegistry.addCronJob(jobName, job);
        job.start();
        this.scheduledJobs.set(libraryId, jobName);
        this.logger.debug(`Scan-Job für Bibliothek ${libraryId} geplant (${cron})`, 'SchedulerService');
        return true;
    }
    async scanLibrary(libraryId) {
        if (this.scanningLibraries.has(libraryId)) {
            this.logger.debug(`Scan für Bibliothek ${libraryId} übersprungen - bereits in Bearbeitung`, 'SchedulerService');
            return;
        }
        this.scanningLibraries.add(libraryId);
        this.logger.debug(`Geplanter Scan für Bibliothek ${libraryId} gestartet`, 'SchedulerService');
        try {
            await this.libraryService.scanLibrary(libraryId, { recursive: true });
            this.logger.debug(`Geplanter Scan für Bibliothek ${libraryId} abgeschlossen`, 'SchedulerService');
        }
        catch (error) {
            this.logger.error(`Fehler beim geplanten Scan für Bibliothek ${libraryId}: ${error.message}`, error.stack, 'SchedulerService');
        }
        finally {
            this.scanningLibraries.delete(libraryId);
        }
    }
    async cleanupThumbnails() {
        this.logger.debug('Starte geplante Thumbnail-Bereinigung', 'SchedulerService');
    }
    getScheduledJobs() {
        return Array.from(this.scheduledJobs.entries()).map(([libraryId, jobName]) => ({
            libraryId,
            jobName,
            nextRun: this.getNextExecutionTime(jobName),
        }));
    }
    getNextExecutionTime(jobName) {
        try {
            const job = this.schedulerRegistry.getCronJob(jobName);
            return job.nextDate().toJSDate();
        }
        catch (error) {
            return null;
        }
    }
};
exports.SchedulerService = SchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_4AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "cleanupThumbnails", null);
exports.SchedulerService = SchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(library_entity_1.Library)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        library_service_1.LibraryService,
        schedule_1.SchedulerRegistry,
        logger_service_1.LoggerService,
        config_1.ConfigService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map