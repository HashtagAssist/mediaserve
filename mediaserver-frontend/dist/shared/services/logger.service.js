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
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const winston = require("winston");
const config_1 = require("@nestjs/config");
const path = require("path");
let LoggerService = class LoggerService {
    constructor(configService) {
        this.configService = configService;
        const logsDir = this.configService.get('LOGS_DIR', 'logs');
        const environment = this.configService.get('NODE_ENV', 'development');
        const customFormat = winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.printf((_a) => {
            var { level, message, timestamp, context, trace } = _a, meta = __rest(_a, ["level", "message", "timestamp", "context", "trace"]);
            let log = `${timestamp} [${level.toUpperCase()}] `;
            if (context) {
                log += `[${context}] `;
            }
            log += message;
            if (trace) {
                log += `\n${trace}`;
            }
            if (Object.keys(meta).length > 0) {
                log += `\n${JSON.stringify(meta, null, 2)}`;
            }
            return log;
        }));
        const transports = [
            new winston.transports.File({
                filename: path.join(logsDir, 'error.log'),
                level: 'error',
                format: customFormat,
            }),
            new winston.transports.File({
                filename: path.join(logsDir, 'combined.log'),
                format: customFormat,
            }),
        ];
        if (environment !== 'production') {
            transports.push(new winston.transports.Console({
                format: winston.format.combine(winston.format.colorize(), customFormat),
            }));
        }
        this.logger = winston.createLogger({
            level: environment === 'production' ? 'info' : 'debug',
            format: customFormat,
            transports,
            exceptionHandlers: [
                new winston.transports.File({
                    filename: path.join(logsDir, 'exceptions.log'),
                    format: customFormat,
                }),
            ],
            rejectionHandlers: [
                new winston.transports.File({
                    filename: path.join(logsDir, 'rejections.log'),
                    format: customFormat,
                }),
            ],
        });
    }
    log(message, context, meta) {
        this.logger.info(message, Object.assign({ context }, meta));
    }
    error(message, trace, context, meta) {
        this.logger.error(message, Object.assign({ trace, context }, meta));
    }
    warn(message, context, meta) {
        this.logger.warn(message, Object.assign({ context }, meta));
    }
    debug(message, context, meta) {
        this.logger.debug(message, Object.assign({ context }, meta));
    }
    verbose(message, context, meta) {
        this.logger.verbose(message, Object.assign({ context }, meta));
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LoggerService);
//# sourceMappingURL=logger.service.js.map