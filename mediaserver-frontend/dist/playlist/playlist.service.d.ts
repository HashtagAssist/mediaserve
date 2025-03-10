import { Repository } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { Media } from '../media/entities/media.entity';
import { User } from '../user/entities/user.entity';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { LoggerService } from '../shared/services/logger.service';
export declare class PlaylistService {
    private playlistRepository;
    private mediaRepository;
    private userRepository;
    private logger;
    constructor(playlistRepository: Repository<Playlist>, mediaRepository: Repository<Media>, userRepository: Repository<User>, logger: LoggerService);
    create(userId: string, createPlaylistDto: CreatePlaylistDto): Promise<Playlist>;
    findAll(userId: string): Promise<Playlist[]>;
    findOne(id: string, userId: string): Promise<Playlist>;
    update(id: string, userId: string, updatePlaylistDto: UpdatePlaylistDto): Promise<Playlist>;
    remove(id: string, userId: string): Promise<void>;
    addItem(playlistId: string, mediaId: string, userId: string): Promise<Playlist>;
    removeItem(playlistId: string, mediaId: string, userId: string): Promise<Playlist>;
    getUserPlaylists(userId: string): Promise<Playlist[]>;
    getPublicPlaylists(limit?: number): Promise<Playlist[]>;
}
