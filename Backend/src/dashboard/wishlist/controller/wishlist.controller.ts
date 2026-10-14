import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../user/auth/guards/jwt-auth.guard';
import { WishlistService } from '../services/wishlist.service';
import { EnrolledCoursesDto } from 'src/dashboard/dto/dashboard.dto';


@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('wishlist-courses')
  wishlistCourses(@Req() req: any, @Query() query: EnrolledCoursesDto) {
    return this.wishlistService.wishlistCourses(
      req.user.sub,
      query.page ?? 1,
      query.limit ?? 6,
    );
  }

  @Post('wishlist/:courseId')
  addRemoveWishlist(
    @Req() req: any,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.wishlistService.addRemoveWishlist(req.user.sub, courseId);
  }
}