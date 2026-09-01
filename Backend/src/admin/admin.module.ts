import { Module } from '@nestjs/common';

import { AdminAuthModule } from 'src/admin-auth/admin-auth.module';

import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';

import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';

import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';

import { BadgesController } from './controllers/badges.controller';
import { BadgesService } from './services/badges.service';
import { BlogsController } from './controllers/blogs.controller';
import { BlogsService } from './services/blogs.service';
import { BlogCommentService } from './services/blog-comment.service';
import { BlogCommentController } from './controllers/blog-comment.controller';

@Module({
  imports: [
    AdminAuthModule,
  ],

  controllers: [
    AdminController,
    RolesController,
    ProfileController,
    BadgesController,
    BlogsController,
    BlogCommentController,
  ],

  providers: [
    AdminService,
    RolesService,
    ProfileService,
    BadgesService,
    BlogsService,
    BlogCommentService,
  ],
})
export class AdminModule {}