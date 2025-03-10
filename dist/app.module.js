"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const media_module_1 = require("./media/media.module");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const metadata_module_1 = require("./metadata/metadata.module");
const logger_service_1 = require("./shared/services/logger.service");
const path = require("path");
const fs = require("fs");
const child_process_1 = require("child_process");
const util_1 = require("util");
const library_module_1 = require("./library/library.module");
const thumbnail_module_1 = require("./thumbnail/thumbnail.module");
const category_module_1 = require("./category/category.module");
const scheduler_module_1 = require("./scheduler/scheduler.module");
const file_change_module_1 = require("./file-change/file-change.module");
const search_module_1 = require("./search/search.module");
const progress_module_1 = require("./progress/progress.module");
const playlist_module_1 = require("./playlist/playlist.module");
const rating_module_1 = require("./rating/rating.module");
const streaming_module_1 = require("./streaming/streaming.module");
const shared_module_1 = require("./shared/shared.module");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [async () => {
                        const logsDir = path.join(process.cwd(), 'logs');
                        if (!fs.existsSync(logsDir)) {
                            fs.mkdirSync(logsDir, { recursive: true });
                        }
                        try {
                            await execAsync('ffprobe -version');
                            return {
                                LOGS_DIR: logsDir,
                                FFMPEG_INSTALLED: true,
                            };
                        }
                        catch (error) {
                            console.error('FFmpeg ist nicht installiert oder nicht im PATH verfügbar');
                            return {
                                LOGS_DIR: logsDir,
                                FFMPEG_INSTALLED: false,
                            };
                        }
                    }],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
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
            media_module_1.MediaModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            metadata_module_1.MetadataModule,
            library_module_1.LibraryModule,
            thumbnail_module_1.ThumbnailModule,
            category_module_1.CategoryModule,
            scheduler_module_1.SchedulerModule,
            file_change_module_1.FileChangeModule,
            search_module_1.SearchModule,
            progress_module_1.ProgressModule,
            playlist_module_1.PlaylistModule,
            rating_module_1.RatingModule,
            streaming_module_1.StreamingModule,
            shared_module_1.SharedModule,
        ],
        providers: [logger_service_1.LoggerService],
        exports: [logger_service_1.LoggerService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map