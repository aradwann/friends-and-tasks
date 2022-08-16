import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from 'src/users/enums/role.enum';

// we use the const variable here better than specifying it in every place we use it
// not to introduce a typo or a nasty bug
export const ROLES_KEY = 'roles';

// this makes our custom Roles metadata decorator
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);
