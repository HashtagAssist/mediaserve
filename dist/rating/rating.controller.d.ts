import { RatingService } from './rating.service';
import { LoggerService } from '../shared/services/logger.service';
import { CreateRatingDto } from './dto/create-rating.dto';
export declare class RatingController {
    private readonly ratingService;
    private readonly logger;
    constructor(ratingService: RatingService, logger: LoggerService);
    rateMedia(mediaId: string, createRatingDto: CreateRatingDto, req: any): Promise<import("./entities/rating.entity").Rating>;
    getMediaRatings(mediaId: string, req: any): Promise<import("./entities/rating.entity").Rating[]>;
    deleteRating(mediaId: string, req: any): Promise<{
        message: string;
    }>;
    getUserRatings(req: any): Promise<import("./entities/rating.entity").Rating[]>;
}
