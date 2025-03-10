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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../auth/entities/user.entity");
const logger_service_1 = require("../shared/services/logger.service");
let UserService = class UserService {
    constructor(userRepository, logger) {
        this.userRepository = userRepository;
        this.logger = logger;
    }
    async findAll() {
        this.logger.debug('Suche alle Benutzer', 'UserService');
        try {
            const users = await this.userRepository.find({
                select: ['id', 'email', 'username', 'createdAt', 'updatedAt'],
            });
            this.logger.debug(`${users.length} Benutzer gefunden`, 'UserService');
            return users;
        }
        catch (error) {
            this.logger.error(`Fehler beim Abrufen aller Benutzer: ${error.message}`, error.stack, 'UserService');
            throw new common_1.InternalServerErrorException('Fehler beim Abrufen der Benutzer');
        }
    }
    async findOne(id) {
        this.logger.debug(`Suche Benutzer mit ID: ${id}`, 'UserService');
        try {
            const user = await this.userRepository.findOne({
                where: { id },
                select: ['id', 'email', 'username', 'createdAt', 'updatedAt'],
            });
            if (!user) {
                this.logger.warn(`Benutzer mit ID ${id} nicht gefunden`, 'UserService');
                throw new common_1.NotFoundException(`Benutzer mit ID ${id} nicht gefunden`);
            }
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Fehler beim Abrufen des Benutzers ${id}: ${error.message}`, error.stack, 'UserService');
            throw new common_1.InternalServerErrorException('Fehler beim Abrufen des Benutzers');
        }
    }
    async findByEmail(email) {
        this.logger.debug(`Suche Benutzer mit E-Mail: ${email}`, 'UserService');
        try {
            const user = await this.userRepository.findOne({
                where: { email },
                select: ['id', 'email', 'username', 'createdAt', 'updatedAt'],
            });
            if (!user) {
                this.logger.warn(`Benutzer mit E-Mail ${email} nicht gefunden`, 'UserService');
                throw new common_1.NotFoundException(`Benutzer mit E-Mail ${email} nicht gefunden`);
            }
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Fehler beim Abrufen des Benutzers mit E-Mail ${email}: ${error.message}`, error.stack, 'UserService');
            throw new common_1.InternalServerErrorException('Fehler beim Abrufen des Benutzers');
        }
    }
    async remove(id) {
        this.logger.debug(`Lösche Benutzer mit ID: ${id}`, 'UserService');
        try {
            const result = await this.userRepository.delete(id);
            if (result.affected === 0) {
                this.logger.warn(`Benutzer mit ID ${id} nicht gefunden`, 'UserService');
                throw new common_1.NotFoundException(`Benutzer mit ID ${id} nicht gefunden`);
            }
            this.logger.debug(`Benutzer ${id} erfolgreich gelöscht`, 'UserService');
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Fehler beim Löschen des Benutzers ${id}: ${error.message}`, error.stack, 'UserService');
            throw new common_1.InternalServerErrorException('Fehler beim Löschen des Benutzers');
        }
    }
    async update(id, updateData) {
        this.logger.debug(`Aktualisiere Benutzer mit ID: ${id}`, 'UserService');
        try {
            const user = await this.userRepository.findOne({
                where: { id },
                select: ['id', 'email', 'username', 'password', 'createdAt', 'updatedAt'],
            });
            if (!user) {
                this.logger.warn(`Benutzer mit ID ${id} nicht gefunden`, 'UserService');
                throw new common_1.NotFoundException(`Benutzer mit ID ${id} nicht gefunden`);
            }
            if (updateData.password) {
                this.logger.warn(`Versuch, das Passwort über die Update-Methode zu ändern wurde blockiert`, 'UserService');
                delete updateData.password;
            }
            Object.assign(user, updateData);
            const updatedUser = await this.userRepository.save(user);
            this.logger.debug(`Benutzer ${id} erfolgreich aktualisiert`, 'UserService');
            const { password } = updatedUser, result = __rest(updatedUser, ["password"]);
            return result;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Fehler beim Aktualisieren des Benutzers ${id}: ${error.message}`, error.stack, 'UserService');
            throw new common_1.InternalServerErrorException('Fehler beim Aktualisieren des Benutzers');
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        logger_service_1.LoggerService])
], UserService);
//# sourceMappingURL=user.service.js.map