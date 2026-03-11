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
        roles: { has: 'admin' },
      },
    });
  }

  async updateRole(updateUserRoleDto: UpdateUserRoleDto) {

    const { userId, roles } = updateUserRoleDto

    const res = await this.prisma.user.update({
      where: { id: userId },
      data: { roles: roles },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        org_unit: true,
        job_title: true,
        employment_type: true,
        roles: true,
      }
    })

    return { message: `Role updated to ${roles.join(", ")} for ${res.name}`, user: res }
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}