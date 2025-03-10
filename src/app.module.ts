import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaModule } from './media/media.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MetadataModule } from './metadata/metadata.module';
import { LoggerService } from './shared/services/logger.service';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { LibraryModule } from './library/library.module';
import { ThumbnailModule } from './thumbnail/thumbnail.module';
import { CategoryModule } from './category/category.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { FileChangeModule } from './file-change/file-change.module';
import { SearchModule } from './search/search.module';
import { ProgressModule } from './progress/progress.module';
import { PlaylistModule } from './playlist/playlist.module';
import { RatingModule } from './rating/rating.module';
import { StreamingModule } from './streaming/streaming.module';
import { SharedModule } from './shared/shared.module';

const execAsync = promisify(exec);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [async () => {
        // Erstelle Logs-Verzeichnis, falls es nicht existiert
        const logsDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logsDir)) {
          fs.mkdirSync(logsDir, { recursive: true });
        }

        // Prüfe FFmpeg-Installation
        try {
          await execAsync('ffprobe -version');
          return {
            LOGS_DIR: logsDir,
            FFMPEG_INSTALLED: true,
          };
        } catch (error) {
          console.error('FFmpeg ist nicht installiert oder nicht im PATH verfügbar');
          return {
            LOGS_DIR: logsDir,
            FFMPEG_INSTALLED: false,
          };
        }
      }],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'mediaserver'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE', true),
      }),
    }),
    MediaModule,
    AuthModule,
    UserModule,
    MetadataModule,
    LibraryModule,
    ThumbnailModule,
    CategoryModule,
    SchedulerModule,
    FileChangeModule,
    SearchModule,
    ProgressModule,
    PlaylistModule,
    RatingModule,
    StreamingModule,
    SharedModule,
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class AppModule {} 
