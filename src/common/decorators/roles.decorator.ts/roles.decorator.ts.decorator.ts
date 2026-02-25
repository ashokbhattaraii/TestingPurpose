import { SetMetadata } from '@nestjs/common';

export const RolesDecoratorTs = (...args: string[]) => SetMetadata('roles.decorator.ts', args);
