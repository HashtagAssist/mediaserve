import { Library } from '../../library/entities/library.entity';
export declare class FileChange {
    id: string;
    path: string;
    type: string;
    status: string;
    errorMessage: string;
    library: Library;
    createdAt: Date;
    updatedAt: Date;
}
