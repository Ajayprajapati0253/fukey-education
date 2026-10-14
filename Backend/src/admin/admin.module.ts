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
import { EbookService } from './ebooks/services/ebook.service';
import { EbookController } from './ebooks/controller/ebook.controller';
import { FaqController } from './faq/controller/faq.controller';
import { FaqService } from './faq/services/faq.service';
import { FooterSettingService } from './footer-setting/services/footer-setting.service';
import { FooterSettingController } from './footer-setting/controller/footer-setting.controller';
import { EmailSettingController } from './email-setting/controller/email-setting.controller';
import { EmailSettingService } from './email-setting/services/email-setting.service';
import { GeneralSettingController } from './general-setting/controller/general-setting.controller';
import { GeneralSettingService } from './general-setting/services/general-setting.service';
import { FreeCourseCategoryController } from './free-course/controller/free-course-category.controller';
import { FreeCourseCategoryService } from './free-course/services/free-course-category.service';
import { FreeCourseContentController } from './free-course/controller/free-course-content.controller';
import { FreeCourseContentService } from './free-course/services/free-course-content.service';
import { FreeCourseController } from './free-course/controller/free-course.controller';
import { FreeCourseService } from './free-course/services/free-course.service';
import { CourseSubCategoryController } from './course/controller/course-sub-category.controller';
import { CourseSubCategoryService } from './course/services/course-sub-category.service';
import { LiveClassController } from './live-class/controller/live-class.controller';
import { LiveClassService } from './live-class/services/live-class.service';
import { JitsiService } from './live-class/services/jitsi.service';
import { RecurringLiveClassService } from './live-class/services/recurring-live-class.service';
import { FreeCourseDeleteRequestController } from './free-course/controller/free-course-delete-request.controller';
import { FreeCourseDeleteRequestService } from './free-course/services/free-course-delete-request.service';
import { FreeCourseLanguageController } from './free-course/controller/free-course-language.controller';
import { FreeCourseLanguageService } from './free-course/services/free-course-language.service';
import { FreeCourseReviewController } from './free-course/controller/free-course-review.controller';
import { FreeCourseReviewService } from './free-course/services/free-course-review.service';
import { FreeCourseLevelController } from './free-course/controller/free-course-level.controller';
import { FreeCourseLevelService } from './free-course/services/free-course-level.service';
import { FreeCourseSubCategoryController } from './free-course/controller/free-course-sub-category.controller';
import { FreeCourseSubCategoryService } from './free-course/services/free-course-sub-category.service';
import { AboutAffordableEducationController } from './frontend/controller/about-affordable-education.controller';
import { AboutAffordableEducationService } from './frontend/services/about-affordable-education.service';
import { LanguageService } from './languages/services/language.service';
import { LanguageController } from './languages/controller/language.controller';
import { MenubuilderController } from './menu-builder/controller/menu-builder.controller';
import { MenubuilderService } from './menu-builder/services/menu-builder.service';
import { StudyMaterialController } from './study-material/controller/study-material.controller';
import { StudyMaterialService } from './study-material/services/study-material.service';
import { AdminQuestionService } from './online-test/services/admin-question.service';
import { AdminQuestionController } from './online-test/controller/admin-question.controller';
import { NewsletterController } from './news-letter/controller/newsletter.controller';
import { NewsletterService } from './news-letter/services/newsletter.service';
import { AdminOrderController } from './order/controller/admin-order.controller';
import { AdminOrderService } from './order/services/admin-order.service';
import { PageBuilderController } from './page-builder/controller/page-builder.controller';
import { PageBuilderService } from './page-builder/services/page-builder.service';
import { PopupController } from './popup/controller/popup.controller';
import { PopupService } from './popup/services/popup.service';
import { SectionSettingController } from './section-setting/controller/section-setting.controller';
import { SectionSettingService } from './section-setting/services/section-setting.service';
import { SiteColorController } from './site-color/controller/site-color.controller';
import { SiteColorService } from './site-color/services/site-color.service';
import { SocialLinkController } from './social-link/controller/social-link.controller';
import { SocialLinkService } from './social-link/services/social-link.service';
import { TestimonialService } from './testimonial/services/testimonial.service';
import { TestimonialController } from './testimonial/controller/testimonial.controller';
import { AttachRecordingsCommand } from 'src/commands/live-class/attach-recordings.command';
import { RecordingWebhookController } from 'src/common/webhooks/recording-webhook.controller';
import { YtCoursesController } from './yt-courses/controller/yt-courses.controller';
import { YtCoursesService } from './yt-courses/services/yt-courses.service';

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
    DemoClassController,
    EbookController,
    FaqController,
    FooterSettingController,
    EmailSettingController,
    GeneralSettingController,
    FreeCourseCategoryController,
    FreeCourseContentController,
    FreeCourseController,
    CourseSubCategoryController,
    LiveClassController,
    FreeCourseDeleteRequestController,
    FreeCourseLanguageController,
    FreeCourseReviewController,
    FreeCourseLevelController,
    FreeCourseSubCategoryController,
    AboutAffordableEducationController,
    LanguageController,
    MenubuilderController,
    NewsletterController,
    StudyMaterialController,
    AdminQuestionController,
    AdminOrderController,
    PageBuilderController,
    PopupController,
    SectionSettingController,
    SiteColorController,
    SocialLinkController,
    TestimonialController,
    RecordingWebhookController,
    YtCoursesController,


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
    DemoClassService,
    EbookService,
    FaqService,
    FooterSettingService,
    EmailSettingService,
    GeneralSettingService,
    FreeCourseCategoryService,
    FreeCourseContentService,
    FreeCourseService,
    CourseSubCategoryService,
    LiveClassService,
    JitsiService,
    RecurringLiveClassService,
    FreeCourseDeleteRequestService,
    FreeCourseLanguageService,
    FreeCourseReviewService,
    FreeCourseLevelService,
    FreeCourseSubCategoryService,
    AboutAffordableEducationService,
    LanguageService,
    MenubuilderService,
    NewsletterService,
    StudyMaterialService,
    AdminQuestionService,
    AdminOrderService,
    PageBuilderService,
    PopupService,
    SectionSettingService,
    SiteColorService,
    SocialLinkService,
    TestimonialService,
    AttachRecordingsCommand,
    YtCoursesService,
  ],
})
export class AdminModule {}