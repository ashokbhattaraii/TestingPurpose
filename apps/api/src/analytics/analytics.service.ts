import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class AnalyticsService {
    constructor( private prisma: PrismaService) {}

    async findAll(){
        return this.prisma.analytics.findMany();
    }

}
