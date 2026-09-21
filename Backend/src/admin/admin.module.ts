import { Module } from '@nestjs/common';

import { AdminAuthModule } from 'src/admin-auth/admin-auth.module';

import { AdminController } from './admin/controller/admin.controller';


import { BadgesController } from './badges/controller/badges.controller';

import { BlogCommentService } from './blog/service/blog-comment.service';
import { BlogCommentController } from './blog/controller/blog-comment.controller';
import { BlogCategoryController } from './blog/controller/blog-category.controller';
import { BlogCategoryService } from './blog/service/blog-category.service';
import { CareerApplicationController } from './career/controller/career-application.controller';
import { CareerApplicationService } from './career/services/career-application.service';
import { RolesController } from './admin/controller/roles.controller';
import { ProfileController } from './admin/controller/profile.controller';
import { BlogsController } from './blog/controller/blogs.controller';
import { AdminService } from './admin/services/admin.service';
import { RolesService } from './admin/services/roles.service';
import { ProfileService } from './admin/services/profile.service';
import { BadgesService } from './badges/services/badges.service';
import { BlogsService } from './blog/service/blogs.service';
import { CareerController } from './career/controller/career.controller';
import { CareerService } from './career/services/career.service';
import { CouponController } from './coupon/controller/coupon.controller';
import { CouponService } from './coupon/services/coupon.service';
import { CourseCategoryController } from './course/controller/course-category.controller';
import { CourseCategoryService } from './course/services/course-category.service';
import { CourseController } from './course/controller/course.controller';
import { CourseService } from './course/services/course.service';
import { CourseDeleteRequestService } from './course/services/course-delete-request.service';
import { CourseDeleteRequestController } from './course/controller/course-delete-request.controller';
import { CourseLanguageService } from './course/services/course-language.service';
import { CourseLanguageController } from './course/controller/course-language.controller';
import { CourseLevelController } from './course/controller/course-level.controller';
import { CourseLevelService } from './course/services/course-level.service';
import { CurrencyController } from './currency/controller/currency.controller';
import { CurrencyService } from './currency/services/currency.service';
import { CustomerController } from './customer/controller/customer.controller';
import { CustomerService } from './customer/services/customer.service';
import { CommonModule } from 'src/common/common.module';
import { DemoClassController } from './demo-class/controller/demo-class.controller';
import { DemoClassService } from './demo-class/services/demo-class.service';

@Module({
  imports: [
    AdminAuthModule,
    CommonModule,

  ],

  controllers: [
    AdminController,
    RolesController,
    ProfileController,
    BadgesController,
    BlogsController,
    BlogCommentController,
    BlogCategoryController,
    CareerApplicationController,
    CareerController,
    CouponController,
    CourseCategoryController,
    CourseController,
    CourseDeleteRequestController,
    CourseLevelController,
    CourseLanguageController,
    CurrencyController,
    CustomerController,
    DemoClassController

  ],

  providers: [
    AdminService,
    RolesService,
    ProfileService,
    BadgesService,
    BlogsService,
    BlogCommentService,
    BlogCategoryService,
    CareerApplicationService,
    CareerService,
    CouponService,
    CourseCategoryService,
    CourseService,
    CourseDeleteRequestService,
    CourseLanguageService,
    CourseLevelService,
    CurrencyService,
    CustomerService,
    DemoClassService

  ],
})
export class AdminModule {}