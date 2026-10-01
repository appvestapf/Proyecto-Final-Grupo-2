import { Body, Controller, Get, Post } from "@nestjs/common";
import { ChatbotService } from "./chatbot.service";
import { ChatDto } from "./dto/chat.dto";

@Controller('chat')
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,
  ) {}
  @Post()
  chat(@Body()chatDto: ChatDto){
    return this.chatbotService.chat(chatDto.message)
  }
}