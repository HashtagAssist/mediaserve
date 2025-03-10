import { Repository } from 'typeorm';
import { Progress } from './entities/progress.entity';
import { Media } from '../media/entities/media.entity';
import { User } from '../user/entities/user.entity';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { CreateProgressDto } from './dto/create-progress.dto';
export declare class ProgressService {
    private progressRepository;
    private mediaRepository;
    private userRepository;
    private readonly logger;
    constructor(progressRepository: Repository<Progress>, mediaRepository: Repository<Media>, userRepository: Repository<User>);
    create(userId: string, createProgressDto: CreateProgressDto): Promise<Progress>;
    findAllByUser(userId: string): Promise<Progress[]>;
    findContinueWatching(userId: string, limit?: number): Promise<Progress[]>;
    findOne(userId: string, mediaId: string): Promise<Progress>;
    remove(userId: string, mediaId: string): Promise<void>;
    getProgress(userId: string, mediaId: string): Promise<Progress>;
    update(userId: string, mediaId: string, updateProgressDto: UpdateProgressDto): Promise<Progress>;
    updateMediaProgress(userId: string, mediaId: string, updateProgressDto: UpdateProgressDto): Promise<Progress>;
    getAllUserProgress(userId: string): Promise<Progress[]>;
    getContinueWatching(userId: string): Promise<Progress[]>;
    getUserProgress(userId: string): Promise<Progress[]>;
}
