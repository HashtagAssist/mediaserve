import { Media } from '../../media/entities/media.entity';
import { User } from '../../user/entities/user.entity';
export declare class Playlist {
    id: string;
    name: string;
    description?: string;
    isPublic: boolean;
    owner: User;
    items: Media[];
    itemCount: number;
    createdAt: Date;
    updatedAt: Date;
}
