import { Media } from '../../media/entities/media.entity';
import { User } from '../../user/entities/user.entity';
export declare class Rating {
    id: string;
    media: Media;
    user: User;
    value: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}
