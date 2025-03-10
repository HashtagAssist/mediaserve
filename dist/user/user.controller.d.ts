import { UserService } from './user.service';
import { LoggerService } from '../shared/services/logger.service';
import { User } from '../auth/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    private readonly logger;
    constructor(userService: UserService, logger: LoggerService);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        username: string;
        isAdmin: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
