import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoggerService } from '../shared/services/logger.service';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private logger;
    constructor(userRepository: Repository<User>, jwtService: JwtService, logger: LoggerService);
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        username: string;
        isAdmin: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            username: string;
        };
    }>;
}
