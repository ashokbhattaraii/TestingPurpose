import { Module, forwardRef } from "@nestjs/common";
import { SlackService } from "./slack.service";
import { SlackController } from "./slack.controller";
import { LunchModule } from "../lunch/lunch.module";

@Module({
  imports: [forwardRef(() => LunchModule)],
  controllers: [SlackController],
  providers: [SlackService],
  exports: [SlackService]
})
export class SlackModule { }