
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { FrontendService } from '../services/frontend.service';

@Controller('frontend')
export class FrontendController {
  constructor(
    private readonly frontendService: FrontendService,
  ) {}

  // App Settings
  @Get('settings')
  settings() {
    return this.frontendService.settings();
  }

  // Languages
  @Get('languages')
  allLanguages() {
    return this.frontendService.allLanguages();
  }

  // Currencies
  @Get('currencies')
  allCurrency() {
    return this.frontendService.allCurrency();
  }

  // Language Translation File
  @Get('language-file')
  getLanguageFile(@Query('code') code?: string) {
    return this.frontendService.getLanguageFile(code || 'en');
  }

  // Course Languages
  @Get('course-languages')
  courseLanguages(@Query('limit') limit?: string) {
    return this.frontendService.courseLanguages(limit);
  }

  // Course Levels
  @Get('course-levels')
  courseLevels(
    @Query('language') language?: string,
    @Query('limit') limit?: string,
  ) {
    return this.frontendService.courseLevels(
      language || 'en',
      limit,
    );
  }

  // Main Categories
  @Get('categories')
  mainCategories(
    @Query('language') language?: string,
    @Query('limit') limit?: string,
  ) {
    return this.frontendService.mainCategories(
      language || 'en',
      limit,
    );
  }

  // Subcategories by parent category slug
  @Get('categories/:slug/subcategories')
  subCategories(
    @Param('slug') slug: string,
    @Query('language') language?: string,
    @Query('limit') limit?: string,
  ) {
    return this.frontendService.subCategories(
      slug,
      language || 'en',
      limit,
    );
  }

  // Countries
  @Get('countries')
  countryList() {
    return this.frontendService.countryList();
  }

  // Social Links
  @Get('social-links')
  socialLinks() {
    return this.frontendService.socialLinks();
  }

  // Onboarding Screens
  @Get('onboarding-screens')
  onboardingScreens() {
    return this.frontendService.onboardingScreens();
  }

  // Contact Us
  @Post('contact-us')
  @HttpCode(HttpStatus.OK)
  contactUs(
    @Body()
    body: {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      phone?: string;
    },
  ) {
    return this.frontendService.contactUs(body);
  }

  // Newsletter Subscription
  @Post('newsletter')
  @HttpCode(HttpStatus.OK)
  newsletterRequest(
    @Body() body: { email?: string },
  ) {
    return this.frontendService.newsletterRequest(
      body.email,
    );
  }

  // Privacy Policy
  @Get('privacy-policy')
  privacyPolicy(
    @Query('language') language?: string,
  ) {
    return this.frontendService.customPage(
      'privacy-policy',
      language || 'en',
    );
  }

  // Terms and Conditions
  @Get('terms-and-conditions')
  termsAndConditions(
    @Query('language') language?: string,
  ) {
    return this.frontendService.customPage(
      'terms-and-conditions',
      language || 'en',
    );
  }
}
