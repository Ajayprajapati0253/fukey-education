import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AiService } from '../services/ai.service';
import { ExplainAiDto } from '../dto/explain-ai.dto';
import { JwtAuthGuard } from 'src/user/auth/guards/jwt-auth.guard';

// Apne existing USER auth guard ka path yahan lagana

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
  ) {}

  /**
   * POST /ai/explain
   */
  @Post('explain')
  async explain(
    @Req() req: any,
    @Body() dto: ExplainAiDto,
  ) {
    return this.aiService.explain(
      req.user.sub,
      dto,
    );
  }

  /**
   * GET /ai/chats
   */
  @Get('chats')
  async chatList(@Req() req: any) {
    return this.aiService.chatList(
      req.user.sub,
    );
  }

  /**
   * GET /ai/chats/:thread_id
   */
  @Get('chats/:thread_id')
  async chatMessages(
    @Req() req: any,
    @Param('thread_id') threadId: string,
  ) {
    return this.aiService.chatMessages(
      req.user.sub,
      threadId,
    );
  }
}