import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles-decorator/roles.decorator';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('employees')
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  getAdminUsers() {
    return this.userService.getUsers();
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  getAllUsers() {
    return this.userService.getAdminUsers();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  getById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
}
