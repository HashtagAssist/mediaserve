import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediaType } from './enums/media-type.enum';
import { MetadataService } from '../metadata/metadata.service';
import { LoggerService } from '../shared/services/logger.service';
export declare class MediaService {
    private mediaRepository;
    private metadataService;
    private logger;
    constructor(mediaRepository: Repository<Media>, metadataService: MetadataService, logger: LoggerService);
    create(createMediaDto: CreateMediaDto): Promise<Media>;
    findAll(type?: MediaType): Promise<Media[]>;
    findOne(id: string): Promise<Media>;
    update(id: string, updateMediaDto: UpdateMediaDto): Promise<Media>;
    remove(id: string): Promise<void>;
    search(query: string): Promise<Media[]>;
    findByGenre(genre: string): Promise<Media[]>;
    findByYear(year: number): Promise<Media[]>;
    markAsProcessed(id: string): Promise<Media>;
    importDirectory(directoryPath: string): Promise<Media[]>;
}
