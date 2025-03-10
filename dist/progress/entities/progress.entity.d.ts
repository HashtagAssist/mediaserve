import { User } from '../../user/entities/user.entity';
import { Media } from '../../media/entities/media.entity';
export declare class Progress {
    id: string;
    user: User;
    media: Media;
    position: number;
    duration: number;
    completed: boolean;
    playCount: number;
    lastPlayedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
