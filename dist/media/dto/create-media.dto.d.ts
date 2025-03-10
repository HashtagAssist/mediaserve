import { MediaType } from '../enums/media-type.enum';
export declare class CreateMediaDto {
    title: string;
    path: string;
    type: MediaType;
    description?: string;
    genres?: string[];
    year?: number;
}
