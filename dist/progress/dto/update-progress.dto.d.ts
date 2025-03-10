import { CreateProgressDto } from './create-progress.dto';
declare const UpdateProgressDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateProgressDto>>;
export declare class UpdateProgressDto extends UpdateProgressDto_base {
    position?: number;
    duration?: number;
    completed?: boolean;
}
export {};
