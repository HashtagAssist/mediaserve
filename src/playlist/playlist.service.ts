import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { Media } from '../media/entities/media.entity';
import { User } from '../user/entities/user.entity';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { LoggerService } from '../shared/services/logger.service';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private logger: LoggerService,
  ) {}

  async create(userId: string, createPlaylistDto: CreatePlaylistDto): Promise<Playlist> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Benutzer ${userId} nicht gefunden`);
    }

    const playlist = this.playlistRepository.create({
      ...createPlaylistDto,
      owner: user,
      items: [],
      itemCount: 0,
    });

    await this.playlistRepository.save(playlist);
    
    this.logger.debug(
      `Neue Playlist erstellt: ${playlist.name} (ID: ${playlist.id}) von Benutzer ${userId}`,
      'PlaylistService'
    );
    
    return playlist;
  }

  async findAll(userId: string): Promise<Playlist[]> {
    // Finde alle Playlists des Benutzers und öffentliche Playlists anderer Benutzer
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

  async findOne(id: string, userId: string): Promise<Playlist> {
    const playlist = await this.playlistRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });

    if (!playlist) {
      throw new NotFoundException(`Playlist ${id} nicht gefunden`);
    }

    // Prüfe Zugriffsrechte
    if (!playlist.isPublic && playlist.owner.id !== userId) {
      throw new ForbiddenException('Sie haben keinen Zugriff auf diese Playlist');
    }

    return playlist;
  }

  async update(id: string, userId: string, updatePlaylistDto: UpdatePlaylistDto): Promise<Playlist> {
    const playlist = await this.findOne(id, userId);

    // Prüfe, ob der Benutzer der Eigentümer ist
    if (playlist.owner.id !== userId) {
      throw new ForbiddenException('Sie können nur Ihre eigenen Playlists bearbeiten');
    }

    // Aktualisiere die Playlist
    Object.assign(playlist, updatePlaylistDto);
    await this.playlistRepository.save(playlist);
    
    this.logger.debug(
      `Playlist aktualisiert: ${playlist.name} (ID: ${playlist.id})`,
      'PlaylistService'
    );
    
    return playlist;
  }

  async remove(id: string, userId: string): Promise<void> {
    const playlist = await this.findOne(id, userId);

    // Prüfe, ob der Benutzer der Eigentümer ist
    if (playlist.owner.id !== userId) {
      throw new ForbiddenException('Sie können nur Ihre eigenen Playlists löschen');
    }

    await this.playlistRepository.remove(playlist);
    
    this.logger.debug(
      `Playlist gelöscht: ${playlist.name} (ID: ${playlist.id})`,
      'PlaylistService'
    );
  }

  async addItem(playlistId: string, mediaId: string, userId: string): Promise<Playlist> {
    const playlist = await this.findOne(playlistId, userId);

    // Prüfe, ob der Benutzer der Eigentümer ist
    if (playlist.owner.id !== userId) {
      throw new ForbiddenException('Sie können nur zu Ihren eigenen Playlists hinzufügen');
    }

    // Prüfe, ob das Medium existiert
    const media = await this.mediaRepository.findOne({ where: { id: mediaId } });
    if (!media) {
      throw new NotFoundException(`Medium ${mediaId} nicht gefunden`);
    }

    // Prüfe, ob das Medium bereits in der Playlist ist
    const isAlreadyInPlaylist = playlist.items.some(item => item.id === mediaId);
    if (isAlreadyInPlaylist) {
      return playlist; // Medium ist bereits in der Playlist, keine Aktion erforderlich
    }

    // Füge das Medium zur Playlist hinzu
    playlist.items.push(media);
    playlist.itemCount = playlist.items.length;
    
    await this.playlistRepository.save(playlist);
    
    this.logger.debug(
      `Medium ${mediaId} zur Playlist ${playlistId} hinzugefügt`,
      'PlaylistService'
    );
    
    return playlist;
  }

  async removeItem(playlistId: string, mediaId: string, userId: string): Promise<Playlist> {
    const playlist = await this.findOne(playlistId, userId);

    // Prüfe, ob der Benutzer der Eigentümer ist
    if (playlist.owner.id !== userId) {
      throw new ForbiddenException('Sie können nur aus Ihren eigenen Playlists entfernen');
    }

    // Entferne das Medium aus der Playlist
    playlist.items = playlist.items.filter(item => item.id !== mediaId);
    playlist.itemCount = playlist.items.length;
    
    await this.playlistRepository.save(playlist);
    
    this.logger.debug(
      `Medium ${mediaId} aus Playlist ${playlistId} entfernt`,
      'PlaylistService'
    );
    
    return playlist;
  }

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    return this.playlistRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner'],
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async getPublicPlaylists(limit: number = 20): Promise<Playlist[]> {
    return this.playlistRepository.find({
      where: { isPublic: true },
      relations: ['owner'],
      order: {
        updatedAt: 'DESC',
      },
      take: limit,
    });
  }
} 