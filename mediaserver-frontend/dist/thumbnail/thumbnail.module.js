"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThumbnailModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const thumbnail_controller_1 = require("./thumbnail.controller");
const thumbnail_service_1 = require("./thumbnail.service");
const media_entity_1 = require("../media/entities/media.entity");
const library_entity_1 = require("../library/entities/library.entity");
const shared_module_1 = require("../shared/shared.module");
const config_1 = require("@nestjs/config");
let ThumbnailModule = class ThumbnailModule {
};
exports.ThumbnailModule = ThumbnailModule;
exports.ThumbnailModule = ThumbnailModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([media_entity_1.Media, library_entity_1.Library]),
            shared_module_1.SharedModule,
            config_1.ConfigModule,
        ],
        controllers: [thumbnail_controller_1.ThumbnailController],
        providers: [thumbnail_service_1.ThumbnailService],
        exports: [thumbnail_service_1.ThumbnailService],
    })
], ThumbnailModule);
//# sourceMappingURL=thumbnail.module.js.map