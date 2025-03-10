import { CategoryService } from './category.service';
import { LoggerService } from '../shared/services/logger.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoryController {
    private readonly categoryService;
    private readonly logger;
    constructor(categoryService: CategoryService, logger: LoggerService);
    create(createCategoryDto: CreateCategoryDto): Promise<import("./entities/category.entity").Category>;
    findAll(): Promise<import("./entities/category.entity").Category[]>;
    findOne(id: string): Promise<import("./entities/category.entity").Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<import("./entities/category.entity").Category>;
    remove(id: string): Promise<{
        message: string;
    }>;
    addMedia(id: string, mediaId: string): Promise<{
        message: string;
    }>;
    removeMedia(id: string, mediaId: string): Promise<{
        message: string;
    }>;
}
