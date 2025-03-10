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
exports.PlaylistService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const playlist_entity_1 = require("./entities/playlist.entity");
const media_entity_1 = require("../media/entities/media.entity");
const user_entity_1 = require("../user/entities/user.entity");
const logger_service_1 = require("../shared/services/logger.service");
let PlaylistService = class PlaylistService {
    constructor(playlistRepository, mediaRepository, userRepository, logger) {
        this.playlistRepository = playlistRepository;
        this.mediaRepository = mediaRepository;
        this.userRepository = userRepository;
        this.logger = logger;
    }
    async create(userId, createPlaylistDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`Benutzer ${userId} nicht gefunden`);
        }
        const playlist = this.playlistRepository.create(Object.assign(Object.assign({}, createPlaylistDto), { owner: user, items: [], itemCount: 0 }));
        await this.playlistRepository.save(playlist);
        this.logger.debug(`Neue Playlist erstellt: ${playlist.name} (ID: ${playlist.id}) von Benutzer ${userId}`, 'PlaylistService');
        return playlist;
    }
    async findAll(userId) {
        return this.playlistRepository.find({
            where: [
                { owner: { id: userId } },
                { isPublic: true },
            ],
            relations: ['owner'],
            order: {
                updatedAt: 'DESC',
            },
        });
    }
    async findOne(id, userId) {
        const playlist = await this.playlistRepository.findOne({
            where: { id },
            relations: ['owner', 'items'],
        });
        if (!playlist) {
            throw new common_1.NotFoundException(`Playlist ${id} nicht gefunden`);
        }
        if (!playlist.isPublic && playlist.owner.id !== userId) {
            throw new common_1.ForbiddenException('Sie haben keinen Zugriff auf diese Playlist');
        }
        return playlist;
    }
    async update(id, userId, updatePlaylistDto) {
        const playlist = await this.findOne(id, userId);
        if (playlist.owner.id !== userId) {
            throw new common_1.ForbiddenException('Sie können nur Ihre eigenen Playlists bearbeiten');
        }
        Object.assign(playlist, updatePlaylistDto);
        await this.playlistRepository.save(playlist);
        this.logger.debug(`Playlist aktualisiert: ${playlist.name} (ID: ${playlist.id})`, 'PlaylistService');
        return playlist;
    }
    async remove(id, userId) {
        const playlist = await this.findOne(id, userId);
        if (playlist.owner.id !== userId) {
            throw new common_1.ForbiddenException('Sie können nur Ihre eigenen Playlists löschen');
        }
        await this.playlistRepository.remove(playlist);
        this.logger.debug(`Playlist gelöscht: ${playlist.name} (ID: ${playlist.id})`, 'PlaylistService');
    }
    async addItem(playlistId, mediaId, userId) {
        const playlist = await this.findOne(playlistId, userId);
        if (playlist.owner.id !== userId) {
            throw new common_1.ForbiddenException('Sie können nur zu Ihren eigenen Playlists hinzufügen');
        }
        const media = await this.mediaRepository.findOne({ where: { id: mediaId } });
        if (!media) {
            throw new common_1.NotFoundException(`Medium ${mediaId} nicht gefunden`);
        }
        const isAlreadyInPlaylist = playlist.items.some(item => item.id === mediaId);
        if (isAlreadyInPlaylist) {
            return playlist;
        }
        playlist.items.push(media);
        playlist.itemCount = playlist.items.length;
        await this.playlistRepository.save(playlist);
        this.logger.debug(`Medium ${mediaId} zur Playlist ${playlistId} hinzugefügt`, 'PlaylistService');
        return playlist;
    }
    async removeItem(playlistId, mediaId, userId) {
        const playlist = await this.findOne(playlistId, userId);
        if (playlist.owner.id !== userId) {
            throw new common_1.ForbiddenException('Sie können nur aus Ihren eigenen Playlists entfernen');
        }
        playlist.items = playlist.items.filter(item => item.id !== mediaId);
        playlist.itemCount = playlist.items.length;
        await this.playlistRepository.save(playlist);
        this.logger.debug(`Medium ${mediaId} aus Playlist ${playlistId} entfernt`, 'PlaylistService');
        return playlist;
    }
    async getUserPlaylists(userId) {
        return this.playlistRepository.find({
            where: { owner: { id: userId } },
            relations: ['owner'],
            order: {
                updatedAt: 'DESC',
            },
        });
    }
    async getPublicPlaylists(limit = 20) {
        return this.playlistRepository.find({
            where: { isPublic: true },
            relations: ['owner'],
            order: {
                updatedAt: 'DESC',
            },
            take: limit,
        });
    }
};
exports.PlaylistService = PlaylistService;
exports.PlaylistService = PlaylistService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(playlist_entity_1.Playlist)),
    __param(1, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        logger_service_1.LoggerService])
], PlaylistService);
//# sourceMappingURL=playlist.service.js.map