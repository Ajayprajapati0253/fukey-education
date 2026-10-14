
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../user/auth/guards/jwt-auth.guard';
import { ReviewsService } from '../services/reviews.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('reviews')
  getReviews(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.reviewsService.getReviews(
      req.user.sub,
      limit,
      page,
    );
  }

  @Get('reviews/:id')
  getReviewDetails(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reviewsService.getReviewDetails(
      req.user.sub,
      id,
    );
  }

  @Delete('reviews/:id')
  deleteReview(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reviewsService.deleteReview(
      req.user.sub,
      id,
    );
  }
}
