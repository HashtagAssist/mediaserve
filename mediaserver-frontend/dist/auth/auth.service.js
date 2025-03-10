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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const bcrypt = require("bcrypt");
const logger_service_1 = require("../shared/services/logger.service");
let AuthService = class AuthService {
    constructor(userRepository, jwtService, logger) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.logger = logger;
    }
    async register(registerDto) {
        this.logger.debug(`Registrierungsversuch für E-Mail: ${registerDto.email}`, 'AuthService');
        try {
            const existingUser = await this.userRepository.findOne({
                where: [
                    { email: registerDto.email },
                    { username: registerDto.username },
                ],
            });
            if (existingUser) {
                this.logger.warn(`Registrierung fehlgeschlagen - Benutzer existiert bereits: ${registerDto.email}`, 'AuthService');
                throw new common_1.ConflictException('Email oder Benutzername bereits vergeben');
            }
            const hashedPassword = await bcrypt.hash(registerDto.password, 10);
            const user = this.userRepository.create(Object.assign(Object.assign({}, registerDto), { password: hashedPassword }));
            await this.userRepository.save(user);
            this.logger.debug(`Benutzer erfolgreich registriert: ${user.email}`, 'AuthService');
            const { password } = user, result = __rest(user, ["password"]);
            return result;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            this.logger.error(`Registrierungsfehler für ${registerDto.email}: ${error.message}`, error.stack, 'AuthService');
            throw new common_1.InternalServerErrorException('Registrierung fehlgeschlagen');
        }
    }
    async login(loginDto) {
        this.logger.debug(`Anmeldeversuch für E-Mail: ${loginDto.email}`, 'AuthService');
        try {
            const user = await this.userRepository.findOne({
                where: { email: loginDto.email },
            });
            if (!user) {
                this.logger.warn(`Anmeldeversuch fehlgeschlagen - Benutzer nicht gefunden: ${loginDto.email}`, 'AuthService');
                throw new common_1.UnauthorizedException('Ungültige Anmeldedaten');
            }
            const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
            if (!isPasswordValid) {
                this.logger.warn(`Anmeldeversuch fehlgeschlagen - Falsches Passwort: ${loginDto.email}`, 'AuthService');
                throw new common_1.UnauthorizedException('Ungültige Anmeldedaten');
            }
            const payload = { sub: user.id, email: user.email };
            const token = this.jwtService.sign(payload);
            this.logger.debug(`Benutzer erfolgreich angemeldet: ${user.email}`, 'AuthService');
            return {
                access_token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error(`Anmeldefehler für ${loginDto.email}: ${error.message}`, error.stack, 'AuthService');
            throw new common_1.InternalServerErrorException('Anmeldung fehlgeschlagen');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        logger_service_1.LoggerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map