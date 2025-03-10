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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const logger_service_1 = require("../shared/services/logger.service");
const swagger_1 = require("@nestjs/swagger");
let AuthController = class AuthController {
    constructor(authService, logger) {
        this.authService = authService;
        this.logger = logger;
    }
    async register(registerDto) {
        this.logger.debug(`Registrierungsversuch für: ${registerDto.email}`, 'AuthController');
        try {
            const result = await this.authService.register(registerDto);
            this.logger.debug(`Registrierung erfolgreich: ${registerDto.email}`, 'AuthController');
            return result;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                this.logger.warn(`Registrierung fehlgeschlagen - Benutzer existiert bereits: ${registerDto.email}`, 'AuthController');
                throw error;
            }
            this.logger.error(`Registrierungsfehler für ${registerDto.email}: ${error.message}`, error.stack, 'AuthController');
            throw new common_1.InternalServerErrorException('Registrierung fehlgeschlagen');
        }
    }
    async login(loginDto) {
        this.logger.debug(`Anmeldeversuch für: ${loginDto.email}`, 'AuthController');
        try {
            const result = await this.authService.login(loginDto);
            this.logger.debug(`Anmeldung erfolgreich: ${loginDto.email}`, 'AuthController');
            return result;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                this.logger.warn(`Anmeldeversuch fehlgeschlagen für: ${loginDto.email}`, 'AuthController');
                throw error;
            }
            this.logger.error(`Anmeldefehler für ${loginDto.email}: ${error.message}`, error.stack, 'AuthController');
            throw new common_1.InternalServerErrorException('Anmeldung fehlgeschlagen');
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrieren', description: 'Erstellt einen neuen Benutzer.' }),
    (0, swagger_1.ApiBody)({
        type: register_dto_1.RegisterDto,
        examples: {
            'Neue Registrierung': {
                value: {
                    email: 'neu@beispiel.de',
                    password: 'sicheres_passwort123',
                    username: 'neuerbenutzer'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Benutzer erfolgreich registriert',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                email: { type: 'string', example: 'neu@beispiel.de' },
                username: { type: 'string', example: 'neuerbenutzer' },
                createdAt: { type: 'string', format: 'date-time', example: '2025-03-10T12:00:00Z' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Ungültige Daten' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'E-Mail oder Benutzername bereits vergeben' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Anmelden', description: 'Meldet einen Benutzer an und gibt ein JWT-Token zurück.' }),
    (0, swagger_1.ApiBody)({
        type: login_dto_1.LoginDto,
        examples: {
            'Standard-Login': {
                value: {
                    email: 'benutzer@beispiel.de',
                    password: 'passwort123'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Erfolgreich angemeldet',
        schema: {
            type: 'object',
            properties: {
                access_token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                        email: { type: 'string', example: 'benutzer@beispiel.de' },
                        username: { type: 'string', example: 'benutzer123' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Ungültige Anmeldedaten' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentifizierung'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        logger_service_1.LoggerService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map