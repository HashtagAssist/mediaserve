import { Repository } from 'typeorm';
import { Media } from '../media/entities/media.entity';
import { LoggerService } from '../shared/services/logger.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoryService {
    private categoryRepository;
    private mediaRepository;
    private logger;
    private readonly movieGenreRules;
    private readonly musicGenreRules;
    constructor(categoryRepository: Repository<Category>, mediaRepository: Repository<Media>, logger: LoggerService);
    create(createCategoryDto: CreateCategoryDto): Promise<Category>;
    findAll(): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
    remove(id: string): Promise<void>;
    addMedia(categoryId: string, mediaId: string): Promise<void>;
    removeMedia(categoryId: string, mediaId: string): Promise<void>;
    categorizeMedia(mediaId: string): Promise<string[]>;
    categorizeLibrary(libraryId: string): Promise<number>;
    private detectGenres;
    private analyzeText;
}
