import { Media } from '../../media/entities/media.entity';
export declare class Category {
    id: string;
    name: string;
    description: string;
    media: Media[];
    createdAt: Date;
    updatedAt: Date;
}
