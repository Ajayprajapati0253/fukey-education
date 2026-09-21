import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CustomerService } from '../services/customer.service';

import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { UpdateCustomerLocationDto } from '../dto/update-customer-location.dto';
import { UpdateCustomerSocialDto } from '../dto/update-customer-social.dto';
import { ChangeCustomerPasswordDto } from '../dto/change-customer-password.dto';
import { CustomerBanDto } from '../dto/customer-ban.dto';
import { EnrollStudentDto } from '../dto/enroll-customer.dto';
import { UpdateCustomerBioDto } from '../dto/update-customer-bio.dto';
import { CreateInstructorDto } from '../dto/create-instructor.dto';

import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';
import { CreateCustomerExperienceDto } from '../dto/create-customer-experience.dto';
import { UpdateCustomerExperienceDto } from '../dto/update-customer-experience.dto';
import { CreateCustomerEducationDto } from '../dto/create-customer-education.dto';
import { UpdateCustomerEducationDto } from '../dto/update-customer-education.dto';
import { SendCustomerMailDto } from '../dto/send-customer-mail.dto';
import { SendBulkCustomerMailDto } from '../dto/send-bulk-customer-mail.dto';

@Controller('admin/customers')
@UseGuards(AdminAuthGuard)
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
  ) {}

  // =========================================================
  // CUSTOMER
  // =========================================================

  // Create customer
  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }

  // Customer listing
  @Get()
  findAll(
    @Query('keyword') keyword?: string,
    @Query('verified') verified?: string,
    @Query('banned') banned?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('order_by') order_by?: string,
  ) {
    return this.customerService.findAll({
      keyword,
      verified,
      banned,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 15,
      order_by,
    });
  }

  // Active customers
  @Get('active')
  activeCustomers(
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('order_by') order_by?: string,
  ) {
    return this.customerService.activeCustomers({
      keyword,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 15,
      order_by,
    });
  }

  // Non verified customers
  @Get('non-verified')
  nonVerifiedCustomers(
    @Query('keyword') keyword?: string,
    @Query('banned') banned?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('order_by') order_by?: string,
  ) {
    return this.customerService.nonVerifiedCustomers({
      keyword,
      banned,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 15,
      order_by,
    });
  }

  // Banned customers
  @Get('banned')
  bannedCustomers(
    @Query('keyword') keyword?: string,
    @Query('verified') verified?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('order_by') order_by?: string,
  ) {
    return this.customerService.bannedCustomers({
      keyword,
      verified,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 15,
      order_by,
    });
  }

  // =========================================================
  // INSTRUCTORS
  // IMPORTANT: These routes must be BEFORE @Get(':id')
  // =========================================================

  // Create instructor
  @Post('instructors')
  async createInstructor(@Body() dto: CreateInstructorDto) {
    return this.customerService.createInstructor(dto);
  }

  // Instructor listing
  @Get('instructors')
  async getAllInstructors(@Query() query: any) {
    return this.customerService.getAllInstructors(query);
  }

  // Show instructor
  @Get('instructors/:id')
  async getInstructorById(@Param('id') id: string) {
    return this.customerService.getInstructorById(id);
  }

  // Update instructor
  @Patch('instructors/:id')
  async updateInstructor(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.updateInstructor(id, dto);
  }

  // Delete instructor
  @Delete('instructors/:id')
  async deleteInstructor(@Param('id') id: string) {
    return this.customerService.deleteInstructor(id);
  }

  // =========================================================
  // CUSTOMER :id ROUTES
  // =========================================================

  // Show customer
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  // Update basic info
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, dto);
  }

  // Bio
  @Patch(':id/bio')
  updateBio(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerBioDto,
  ) {
    return this.customerService.updateBio(id, dto);
  }

  // Location
  @Patch(':id/location')
  updateLocation(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerLocationDto,
  ) {
    return this.customerService.updateLocation(id, dto);
  }

  // Social
  @Patch(':id/social')
  updateSocial(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerSocialDto,
  ) {
    return this.customerService.updateSocial(id, dto);
  }

  // Password
  @Patch(':id/password')
  changePassword(
    @Param('id') id: string,
    @Body() dto: ChangeCustomerPasswordDto,
  ) {
    return this.customerService.changePassword(id, dto);
  }

  // Ban / Unban
  @Patch(':id/ban')
  toggleBan(
    @Param('id') id: string,
    @Body() dto: CustomerBanDto,
  ) {
    return this.customerService.toggleBan(id, dto);
  }

  // Manual verify
  @Patch(':id/verify')
  verifyAccountManually(@Param('id') id: string) {
    return this.customerService.verifyAccountManually(id);
  }

  // Send verification request
  @Post(':id/send-verification')
  sendVerifyRequest(@Param('id') id: string) {
    return this.customerService.sendVerifyRequest(id);
  }

  // Enroll student
  @Post(':id/enroll')
  enrollStudent(
    @Param('id') id: string,
    @Body() dto: EnrollStudentDto,
  ) {
    return this.customerService.enrollStudent(id, dto);
  }

  // Delete customer
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }


  @Post(':id/experience')
createExperience(
  @Param('id') id: string,
  @Body() dto: CreateCustomerExperienceDto,
) {
  return this.customerService.createExperience(id, dto);
}

@Get(':id/experiences')
getExperiences(@Param('id') id: string) {
  return this.customerService.getExperiences(id);
}

@Get(':id/experience/:experienceId')
getExperienceById(
  @Param('id') id: string,
  @Param('experienceId') experienceId: string,
) {
  return this.customerService.getExperienceById(id, experienceId);
}

@Patch(':id/experience/:experienceId')
updateExperience(
  @Param('id') id: string,
  @Param('experienceId') experienceId: string,
  @Body() dto: UpdateCustomerExperienceDto,
) {
  return this.customerService.updateExperience(experienceId, dto);
}


@Delete(':id/experience/:experienceId')
deleteExperience(
  @Param('id') id: string,
  @Param('experienceId') experienceId: string,
) {
  return this.customerService.deleteExperience(experienceId);
}

@Post(':id/education')
createEducation(
  @Param('id') id: string,
  @Body() dto: CreateCustomerEducationDto,
) {
  return this.customerService.createEducation(id, dto);
}

@Get(':id/educations')
getEducations(@Param('id') id: string) {
  return this.customerService.getEducations(id);
}

@Get(':id/education/:educationId')
getEducationById(
  @Param('id') id: string,
  @Param('educationId') educationId: string,
) {
  return this.customerService.getEducationById(id, educationId);
}

@Patch(':id/education/:educationId')
updateEducation(
  @Param('id') id: string,
  @Param('educationId') educationId: string,
  @Body() dto: UpdateCustomerEducationDto,
) {
  return this.customerService.updateEducation(
    id,
    educationId,
    dto,
  );
}

@Delete(':id/education/:educationId')
deleteEducation(
  @Param('id') id: string,
  @Param('educationId') educationId: string,
) {
  return this.customerService.deleteEducation(
    id,
    educationId,
  );
}

@Delete(':id/enrollment/:enrollmentId')
removeEnrollment(
  @Param('id') id: string,
  @Param('enrollmentId') enrollmentId: string,
) {
  return this.customerService.removeEnrollment(
    id,
    enrollmentId,
  );
}


@Post('send-verification-to-all')
sendVerifyRequestToAll() {
  return this.customerService.sendVerifyRequestToAll();
}

@Post(':id/send-mail')
sendMailToCustomer(
  @Param('id') id: string,
  @Body() dto: SendCustomerMailDto,
) {
  return this.customerService.sendMailToCustomer(id, dto);
}

@Post('send-bulk-mail')
sendBulkMailToAll(@Body() dto: SendBulkCustomerMailDto) {
  return this.customerService.sendBulkMailToAll(dto);
}

}

