
import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import express from 'express';
import { NewsletterService } from '../services/newsletter.service';
import { NewsletterRequestDto } from '../dto/newsletter-request.dto';


@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('request')
  newsletterRequest(@Body() dto: NewsletterRequestDto) {
    return this.newsletterService.newsletterRequest(dto);
  }

  @Get('verification/:token')
  async newsletterVerification(
    @Param('token') token: string,
    @Res() res: express.Response,
  ) {
    try {
      await this.newsletterService.newsletterVerification(token);
      return res.redirect('/');
    } catch {
      return res.redirect('/');
    }
  }
}
