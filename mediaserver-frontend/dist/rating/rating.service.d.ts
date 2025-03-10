import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { Media } from '../media/entities/media.entity';
import { User } from '../user/entities/user.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { LoggerService } from '../shared/services/logger.service';
export declare class RatingService {
    private ratingRepository;
    private mediaRepository;
    private userRepository;
    private logger;
    constructor(ratingRepository: Repository<Rating>, mediaRepository: Repository<Media>, userRepository: Repository<User>, logger: LoggerService);
    rateMedia(userId: string, mediaId: string, createRatingDto: CreateRatingDto): Promise<Rating>;
    getUserRating(userId: string, mediaId: string): Promise<Rating>;
    getMediaRatings(mediaId: string, userId?: string): Promise<Rating[]>;
    getUserRatings(userId: string): Promise<Rating[]>;
    deleteRating(userId: string, mediaId: string): Promise<void>;
    private updateMediaAverageRating;
}
