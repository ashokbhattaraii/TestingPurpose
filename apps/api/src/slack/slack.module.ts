import { Module } from "@nestjs/common";
import { SlackService } from "./slack.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { LaunchController } from "src/launch/launch.controller";
import { LaunchService } from "src/launch/launch.service";

@Module({
    imports: [PrismaModule, SlackModule],
    controllers: [LaunchController],
    providers: [LaunchService],


})

export class SlackModule { }