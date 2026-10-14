
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import type { Request } from 'express';
// Replace with the actual guard already used by your student APIs.
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserPopupService } from '../services/popup.service';
import { MarkPopupSeenDto } from '../dto/create.popup.dto';


@Controller('user/popup')
export class UserPopupController {
  constructor(
    private readonly popupService: UserPopupService,
  ) {}

  @Get('latest')
  @UseGuards(JwtAuthGuard)
  latest(@Req() req: Request) {
    const user = req.user as { id?: string | number } | undefined;
    return this.popupService.latest(user?.id);
  }

  @Post('mark-seen')
  @UseGuards(JwtAuthGuard)
  markSeen(
    @Req() req: Request,
    @Body() dto: MarkPopupSeenDto,
  ) {
    const user = req.user as { id?: string | number } | undefined;

    return this.popupService.markSeen(
      user?.id,
      dto.popup_id,
    );
  }
}
