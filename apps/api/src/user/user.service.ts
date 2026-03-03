import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserRoleDto } from '../dto/updateUserRole.dto';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async getUsers() {
    return this.prisma.user.findMany();
  }

  async getAdminUsers() {
    return this.prisma.user.findMany({
      where: {
        role: 'ADMIN',
      },
    });
  }

  async updateRole(updateUserRoleDto: UpdateUserRoleDto) {

    const { userId, role } = updateUserRoleDto

    const res = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
      }
    })

    return { message: `Role updated to ${role} for ${res.name}`, user: res }
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}