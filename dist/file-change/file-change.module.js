"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileChangeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const file_change_controller_1 = require("./file-change.controller");
const file_change_service_1 = require("./file-change.service");
const file_change_entity_1 = require("./entities/file-change.entity");
const media_entity_1 = require("../media/entities/media.entity");
const library_entity_1 = require("../library/entities/library.entity");
const shared_module_1 = require("../shared/shared.module");
let FileChangeModule = class FileChangeModule {
};
exports.FileChangeModule = FileChangeModule;
exports.FileChangeModule = FileChangeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([file_change_entity_1.FileChange, media_entity_1.Media, library_entity_1.Library]),
            shared_module_1.SharedModule,
        ],
        controllers: [file_change_controller_1.FileChangeController],
        providers: [file_change_service_1.FileChangeService],
        exports: [file_change_service_1.FileChangeService],
    })
], FileChangeModule);
//# sourceMappingURL=file-change.module.js.map