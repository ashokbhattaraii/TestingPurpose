import { Injectable } from "@nestjs/common";
import { env } from "process";

@Injectable()
export class SlackService {
  private readonly webhookUrl = process.env.WEB_HOOK_URL;

  constructor() { }

  async sendLunchNotification() {
    const payload = {
      text: "Lunch time! 🍜",
    };
    if (!this.webhookUrl) {
      throw new Error("WEB_HOOK_URL environment variable is not defined");
    }

    await fetch(this.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

}