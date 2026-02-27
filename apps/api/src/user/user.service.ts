import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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
}
