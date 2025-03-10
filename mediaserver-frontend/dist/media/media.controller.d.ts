import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediaType } from './enums/media-type.enum';
import { LoggerService } from '../shared/services/logger.service';
import { Media } from './entities/media.entity';
export declare class MediaController {
    private readonly mediaService;
    private readonly logger;
    constructor(mediaService: MediaService, logger: LoggerService);
    create(createMediaDto: CreateMediaDto): Promise<Media>;
    findAll(type?: MediaType): Promise<Media[]>;
    search(query: string): Promise<Media[]>;
    findByGenre(genre: string): Promise<Media[]>;
    findByYear(year: number): Promise<Media[]>;
    findOne(id: string): Promise<Media>;
    update(id: string, updateMediaDto: UpdateMediaDto): Promise<Media>;
    remove(id: string): Promise<{
        message: string;
    }>;
    markAsProcessed(id: string): Promise<Media>;
    importDirectory(directoryPath: string): Promise<Media[]>;
}
