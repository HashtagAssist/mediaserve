import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { Library } from '../library/entities/library.entity';
import { LibraryService } from '../library/library.service';
import { LoggerService } from '../shared/services/logger.service';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly scanningLibraries = new Set<string>();
  private readonly scheduledJobs = new Map<string, string>();

  constructor(
    @InjectRepository(Library)
    private libraryRepository: Repository<Library>,
    private libraryService: LibraryService,
    private schedulerRegistry: SchedulerRegistry,
    private logger: LoggerService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.setupScheduledJobs();
  }

  private async setupScheduledJobs() {
    // Lade alle Bibliotheken mit aktiviertem autoScan
    const libraries = await this.libraryRepository.find({
      where: { autoScan: true },
    });

    this.logger.debug(
      `Initialisiere Scheduler für ${libraries.length} Bibliotheken mit autoScan`,
      'SchedulerService'
    );

    // Erstelle für jede Bibliothek einen eigenen Job
    for (const library of libraries) {
      await this.scheduleLibraryScan(library.id);
    }
  }

  async scheduleLibraryScan(libraryId: string, cronExpression?: string) {
    // Prüfe, ob die Bibliothek existiert
    const library = await this.libraryRepository.findOne({ where: { id: libraryId } });
    if (!library) {
      this.logger.warn(`Bibliothek ${libraryId} nicht gefunden`, 'SchedulerService');
      return false;
    }

    // Entferne bestehenden Job, falls vorhanden
    if (this.scheduledJobs.has(libraryId)) {
      const jobName = this.scheduledJobs.get(libraryId);
      try {
        this.schedulerRegistry.deleteCronJob(jobName);
        this.scheduledJobs.delete(libraryId);
        this.logger.debug(`Bestehender Scan-Job für Bibliothek ${libraryId} entfernt`, 'SchedulerService');
      } catch (error) {
        this.logger.error(
          `Fehler beim Entfernen des bestehenden Jobs: ${error.message}`,
          error.stack,
          'SchedulerService'
        );
      }
    }

    // Wenn autoScan deaktiviert ist und kein expliziter Cron-Ausdruck angegeben wurde, nicht planen
    if (!library.autoScan && !cronExpression) {
      this.logger.debug(
        `Kein Scan-Job für Bibliothek ${libraryId} geplant (autoScan deaktiviert)`,
        'SchedulerService'
      );
      return false;
    }

    // Verwende den angegebenen Cron-Ausdruck oder den Standardwert
    const cron = cronExpression || this.configService.get('DEFAULT_SCAN_SCHEDULE', CronExpression.EVERY_DAY_AT_MIDNIGHT);
    const jobName = `library-scan-${libraryId}`;

    // Erstelle einen neuen Cron-Job
    const job = new CronJob(cron, () => {
      this.scanLibrary(libraryId);
    });

    // Registriere den Job
    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();

    // Speichere den Job-Namen für spätere Referenz
    this.scheduledJobs.set(libraryId, jobName);

    this.logger.debug(
      `Scan-Job für Bibliothek ${libraryId} geplant (${cron})`,
      'SchedulerService'
    );

    return true;
  }

  async scanLibrary(libraryId: string) {
    // Verhindere parallele Scans derselben Bibliothek
    if (this.scanningLibraries.has(libraryId)) {
      this.logger.debug(
        `Scan für Bibliothek ${libraryId} übersprungen - bereits in Bearbeitung`,
        'SchedulerService'
      );
      return;
    }

    this.scanningLibraries.add(libraryId);
    this.logger.debug(`Geplanter Scan für Bibliothek ${libraryId} gestartet`, 'SchedulerService');

    try {
      await this.libraryService.scanLibrary(libraryId, { recursive: true });
      this.logger.debug(`Geplanter Scan für Bibliothek ${libraryId} abgeschlossen`, 'SchedulerService');
    } catch (error) {
      this.logger.error(
        `Fehler beim geplanten Scan für Bibliothek ${libraryId}: ${error.message}`,
        error.stack,
        'SchedulerService'
      );
    } finally {
      this.scanningLibraries.delete(libraryId);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async cleanupThumbnails() {
    this.logger.debug('Starte geplante Thumbnail-Bereinigung', 'SchedulerService');
    // Implementierung der Thumbnail-Bereinigung
    // (Entfernen von Thumbnails für gelöschte Medien)
  }

  getScheduledJobs() {
    return Array.from(this.scheduledJobs.entries()).map(([libraryId, jobName]) => ({
      libraryId,
      jobName,
      nextRun: this.getNextExecutionTime(jobName),
    }));
  }

  private getNextExecutionTime(jobName: string): Date | null {
    try {
      const job = this.schedulerRegistry.getCronJob(jobName);
      return job.nextDate().toJSDate();
    } catch (error) {
      return null;
    }
  }
} 