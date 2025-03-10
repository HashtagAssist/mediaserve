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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const logger_service_1 = require("../shared/services/logger.service");
const user_entity_1 = require("../auth/entities/user.entity");
const swagger_1 = require("@nestjs/swagger");
const update_user_dto_1 = require("./dto/update-user.dto");
let UserController = class UserController {
    constructor(userService, logger) {
        this.userService = userService;
        this.logger = logger;
    }
    async findAll() {
        this.logger.debug('GET /users Anfrage erhalten', 'UserController');
        try {
            const users = await this.userService.findAll();
            this.logger.debug(`${users.length} Benutzer erfolgreich abgerufen`, 'UserController');
            return users;
        }
        catch (error) {
            this.logger.error(`Fehler beim Abrufen aller Benutzer: ${error.message}`, error.stack, 'UserController');
            throw new common_1.InternalServerErrorException('Fehler beim Abrufen der Benutzer');
        }
    }
    async findOne(id) {
        this.logger.debug(`GET /users/${id} Anfrage erhalten`, 'UserController');
        try {
            const user = await this.userService.findOne(id);
            this.logger.debug(`Benutzer ${id} erfolgreich abgerufen`, 'UserController');
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                this.logger.warn(`Benutzer ${id} nicht gefunden`, 'UserController');
                throw error;
            }
            this.logger.error(`Fehler beim Abrufen des Benutzers ${id}: ${error.message}`, error.stack, 'UserController');
            throw new common_1.InternalServerErrorException('Fehler beim Abrufen des Benutzers');
        }
    }
    async update(id, updateUserDto) {
        this.logger.debug(`PUT /users/${id} Anfrage erhalten`, 'UserController');
        try {
            const updatedUser = await this.userService.update(id, updateUserDto);
            this.logger.debug(`Benutzer ${id} erfolgreich aktualisiert`, 'UserController');
            return updatedUser;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                this.logger.warn(`Benutzer ${id} nicht gefunden`, 'UserController');
                throw error;
            }
            this.logger.error(`Fehler beim Aktualisieren des Benutzers ${id}: ${error.message}`, error.stack, 'UserController');
            throw new common_1.InternalServerErrorException('Fehler beim Aktualisieren des Benutzers');
        }
    }
    async remove(id) {
        this.logger.debug(`DELETE /users/${id} Anfrage erhalten`, 'UserController');
        try {
            await this.userService.remove(id);
            this.logger.debug(`Benutzer ${id} erfolgreich gelöscht`, 'UserController');
            return { message: 'Benutzer erfolgreich gelöscht' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                this.logger.warn(`Benutzer ${id} nicht gefunden`, 'UserController');
                throw error;
            }
            this.logger.error(`Fehler beim Löschen des Benutzers ${id}: ${error.message}`, error.stack, 'UserController');
            throw new common_1.InternalServerErrorException('Fehler beim Löschen des Benutzers');
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Alle Benutzer abrufen' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste aller Benutzer',
        type: [user_entity_1.User],
        schema: {
            example: [
                {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    email: 'benutzer@beispiel.de',
                    username: 'benutzer123',
                    createdAt: '2025-03-10T12:00:00Z',
                    updatedAt: '2025-03-10T12:00:00Z'
                }
            ]
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Einen Benutzer abrufen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID des Benutzers', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Der gefundene Benutzer',
        type: user_entity_1.User,
        schema: {
            example: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                email: 'benutzer@beispiel.de',
                username: 'benutzer123',
                createdAt: '2025-03-10T12:00:00Z',
                updatedAt: '2025-03-10T12:00:00Z'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Benutzer nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Benutzer aktualisieren' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID des Benutzers', type: 'string' }),
    (0, swagger_1.ApiBody)({
        type: update_user_dto_1.UpdateUserDto,
        examples: {
            'Benutzerdaten aktualisieren': {
                value: {
                    username: 'neuer_benutzername',
                    email: 'neue_email@beispiel.de'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Aktualisierter Benutzer',
        type: user_entity_1.User
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Benutzer nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Benutzer löschen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID des Benutzers', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Benutzer erfolgreich gelöscht',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Benutzer erfolgreich gelöscht' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Nicht autorisiert' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Benutzer nicht gefunden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "remove", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('Benutzer'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [user_service_1.UserService,
        logger_service_1.LoggerService])
], UserController);
//# sourceMappingURL=user.controller.js.map