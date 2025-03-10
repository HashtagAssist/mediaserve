import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { Media } from '../media/entities/media.entity';
import { User } from '../user/entities/user.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { LoggerService } from '../shared/services/logger.service';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private logger: LoggerService,
  ) {}

  async rateMedia(userId: string, mediaId: string, createRatingDto: CreateRatingDto): Promise<Rating> {
    this.logger.debug(
      `Bewertung für Medium ${mediaId} von Benutzer ${userId}: ${createRatingDto.value} Sterne`,
      'RatingService'
    );
    
    // Prüfe, ob Medium existiert
    const media = await this.mediaRepository.findOne({ where: { id: mediaId } });
    if (!media) {
      throw new NotFoundException(`Medium ${mediaId} nicht gefunden`);
    }
    
    // Prüfe, ob Benutzer existiert
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Benutzer ${userId} nicht gefunden`);
    }
    
    // Suche nach bestehender Bewertung
    let rating = await this.ratingRepository.findOne({
      where: {
        user: { id: userId },
        media: { id: mediaId },
      },
      relations: ['media', 'user'],
    });
    
    if (!rating) {
      // Erstelle neue Bewertung
      rating = this.ratingRepository.create({
        media,
        user,
        value: createRatingDto.value,
        comment: createRatingDto.comment,
      });
      
      this.logger.debug(
        `Neue Bewertung erstellt für Medium ${mediaId} von Benutzer ${userId}`,
        'RatingService'
      );
    } else {
      // Aktualisiere bestehende Bewertung
      rating.value = createRatingDto.value;
      rating.comment = createRatingDto.comment;
      
      this.logger.debug(
        `Bestehende Bewertung aktualisiert für Medium ${mediaId} von Benutzer ${userId}`,
        'RatingService'
      );
    }
    
    await this.ratingRepository.save(rating);
    
    // Aktualisiere die durchschnittliche Bewertung des Mediums
    await this.updateMediaAverageRating(mediaId);
    
    return rating;
  }

  async getUserRating(userId: string, mediaId: string): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: {
        user: { id: userId },
        media: { id: mediaId },
      },
      relations: ['media'],
    });
    
    if (!rating) {
      throw new NotFoundException(`Keine Bewertung gefunden für Medium ${mediaId}`);
    }
    
    return rating;
  }

  async getMediaRatings(mediaId: string, userId?: string): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: {
        media: { id: mediaId },
      },
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getUserRatings(userId: string): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['media'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async deleteRating(userId: string, mediaId: string): Promise<void> {
    const rating = await this.ratingRepository.findOne({
      where: {
        user: { id: userId },
        media: { id: mediaId },
      },
    });
    
    if (!rating) {
      throw new NotFoundException(`Keine Bewertung gefunden für Medium ${mediaId}`);
    }
    
    await this.ratingRepository.remove(rating);
    
    this.logger.debug(
      `Bewertung gelöscht für Medium ${mediaId} von Benutzer ${userId}`,
      'RatingService'
    );
    
    // Aktualisiere die durchschnittliche Bewertung des Mediums
    await this.updateMediaAverageRating(mediaId);
  }

  private async updateMediaAverageRating(mediaId: string): Promise<void> {
    // Berechne die durchschnittliche Bewertung
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.value)', 'average')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.media.id = :mediaId', { mediaId })
      .getRawOne();
    
    const averageRating = result.average ? parseFloat(result.average) : 0;
    const ratingCount = parseInt(result.count, 10);
    
    // Aktualisiere das Medium
    await this.mediaRepository.update(mediaId, {
      averageRating,
      ratingCount,
    });
    
    this.logger.debug(
      `Durchschnittliche Bewertung für Medium ${mediaId} aktualisiert: ${averageRating} (${ratingCount} Bewertungen)`,
      'RatingService'
    );
  }
} 