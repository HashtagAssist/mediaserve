import { Media } from '../../media/entities/media.entity';
export declare class Library {
    id: string;
    name: string;
    path: string;
    autoScan: boolean;
    scanSchedule?: string;
    lastScanned?: Date;
    media: Media[];
    createdAt: Date;
    updatedAt: Date;
}
export interface LibraryStats {
    totalFiles: number;
    processedFiles: number;
    byType: {
        movie: number;
        music: number;
    };
    totalSize: number;
    lastScanned: Date | null;
}
