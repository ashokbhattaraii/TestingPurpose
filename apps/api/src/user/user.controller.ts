import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles-decorator/roles.decorator';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('employees')
  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.ADMIN)
  getAdminUsers() {
    return this.userService.getUsers();
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.SUPER_ADMIN)
  getAllUsers() {
    return this.userService.getAdminUsers();
  }
}
