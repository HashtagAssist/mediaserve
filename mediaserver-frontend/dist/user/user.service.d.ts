import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { LoggerService } from '../shared/services/logger.service';
export declare class UserService {
    private userRepository;
    private logger;
    constructor(userRepository: Repository<User>, logger: LoggerService);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    remove(id: string): Promise<void>;
    update(id: string, updateData: Partial<User>): Promise<{
        id: string;
        email: string;
        username: string;
        isAdmin: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
