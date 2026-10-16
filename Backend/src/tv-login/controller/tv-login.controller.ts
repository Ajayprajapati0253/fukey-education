import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TvLoginService } from '../services/tv-login.service';
import { JwtAuthGuard } from 'src/user/auth/guards/jwt-auth.guard';


@Controller('tv-login')
export class TvLoginController {
  constructor(
    private readonly tvLoginService: TvLoginService,
  ) {}

  @Post('generate')
  generate(
    @Body()
    body: {
      device_name?: string;
      device_model?: string;
    },
  ) {
    return this.tvLoginService.generate(body);
  }

  @Get('status/:code')
  status(@Param('code') code: string) {
    return this.tvLoginService.status(code);
  }

  @Post('authorize')
  @UseGuards(JwtAuthGuard)
  authorizeTv(
    @Body('code') code: string,
    @Req() req: any,
  ) {
    return this.tvLoginService.authorizeTv(
      code,
      String(req.user.id),
    );
  }

  @Get('device-info/:code')
  deviceInfo(@Param('code') code: string) {
    return this.tvLoginService.deviceInfo(code);
  }
}