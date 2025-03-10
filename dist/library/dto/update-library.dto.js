"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLibraryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_library_dto_1 = require("./create-library.dto");
class UpdateLibraryDto extends (0, mapped_types_1.PartialType)(create_library_dto_1.CreateLibraryDto) {
}
exports.UpdateLibraryDto = UpdateLibraryDto;
//# sourceMappingURL=update-library.dto.js.map