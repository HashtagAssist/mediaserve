import { PlaylistService } from './playlist.service';
import { LoggerService } from '../shared/services/logger.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
export declare class PlaylistController {
    private readonly playlistService;
    private readonly logger;
    constructor(playlistService: PlaylistService, logger: LoggerService);
    create(req: any, createPlaylistDto: CreatePlaylistDto): Promise<import("./entities/playlist.entity").Playlist>;
    findAll(req: any): Promise<import("./entities/playlist.entity").Playlist[]>;
    getUserPlaylists(req: any): Promise<import("./entities/playlist.entity").Playlist[]>;
    getPublicPlaylists(limit: number): Promise<import("./entities/playlist.entity").Playlist[]>;
    findOne(req: any, id: string): Promise<import("./entities/playlist.entity").Playlist>;
    update(req: any, id: string, updatePlaylistDto: UpdatePlaylistDto): Promise<import("./entities/playlist.entity").Playlist>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
    addItem(req: any, id: string, mediaId: string): Promise<import("./entities/playlist.entity").Playlist>;
    removeItem(req: any, id: string, mediaId: string): Promise<import("./entities/playlist.entity").Playlist>;
}
