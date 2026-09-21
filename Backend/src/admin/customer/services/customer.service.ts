import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';


import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { UpdateCustomerLocationDto } from '../dto/update-customer-location.dto';
import { UpdateCustomerSocialDto } from '../dto/update-customer-social.dto';
import { ChangeCustomerPasswordDto } from '../dto/change-customer-password.dto';
import { CustomerBanDto } from '../dto/customer-ban.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EnrollStudentDto } from '../dto/enroll-customer.dto';
import { UpdateCustomerBioDto } from '../dto/update-customer-bio.dto';
import { CreateInstructorDto } from '../dto/create-instructor.dto';
import { CreateCustomerExperienceDto } from '../dto/create-customer-experience.dto';
import { UpdateCustomerExperienceDto } from '../dto/update-customer-experience.dto';
import { CreateCustomerEducationDto } from '../dto/create-customer-education.dto';
import { UpdateCustomerEducationDto } from '../dto/update-customer-education.dto';
import { MailService } from 'src/common/services/mail.service';
import { SendCustomerMailDto } from '../dto/send-customer-mail.dto';
import { SendBulkCustomerMailDto } from '../dto/send-bulk-customer-mail.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService,   private readonly mailService: MailService,) {}

  private serializeUser(user: any) {
    if (!user) return user;

    return {
      ...user,
      id: user.id?.toString(),
      country_id: user.country_id?.toString() ?? null,
    };
  }

  private async findUser(id: string) {
    const user = await this.prisma.users.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!user) {
      throw new NotFoundException('Customer not found');
    }

    return user;
  }

  // --------------------------------------------------
  // CREATE CUSTOMER
  // --------------------------------------------------

  async create(dto: CreateCustomerDto) {
    const existing = await this.prisma.users.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existing) {
      throw new BadRequestException('Email already exist');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        role: 'student',
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        status: dto.status,
        email_verified_at: new Date(),
        is_banned: 'no',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Customer created successfully',
      data: this.serializeUser(user),
    };
  }

  // --------------------------------------------------
  // CUSTOMER LIST
  // --------------------------------------------------

  async findAll(params: {
    keyword?: string;
    verified?: string;
    banned?: string;
    page?: number;
    limit?: number;
    order_by?: string;
  }) {
    const {
      keyword,
      verified,
      banned,
      page = 1,
      limit = 15,
      order_by,
    } = params;

    const where: any = {
      role: 'student',
    };

    if (keyword) {
      where.OR = [
        {
          name: {
            contains: keyword,
          },
        },
        {
          email: {
            contains: keyword,
          },
        },
        {
          phone: {
            contains: keyword,
          },
        },
        {
          address: {
            contains: keyword,
          },
        },
      ];
    }

    if (verified === '1') {
      where.email_verified_at = {
        not: null,
      };
    }

    if (verified === '0') {
      where.email_verified_at = null;
    }

    if (banned === '1') {
      where.is_banned = 'yes';
    }

    if (banned === '0') {
      where.is_banned = 'no';
    }

    const total = await this.prisma.users.count({
      where,
    });

    const users = await this.prisma.users.findMany({
      where,
      orderBy: {
        id: order_by === '1' ? 'asc' : 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      status: 'success',
      data: users.map((user) => this.serializeUser(user)),
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  // --------------------------------------------------
  // ACTIVE CUSTOMERS
  // --------------------------------------------------

  async activeCustomers(params: {
    keyword?: string;
    page?: number;
    limit?: number;
    order_by?: string;
  }) {
    const {
      keyword,
      page = 1,
      limit = 15,
      order_by,
    } = params;

    const where: any = {
      role: 'student',
      status: 'active',
      is_banned: 'no',
      email_verified_at: {
        not: null,
      },
    };

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { email: { contains: keyword } },
        { phone: { contains: keyword } },
        { address: { contains: keyword } },
      ];
    }

    const total = await this.prisma.users.count({ where });

    const users = await this.prisma.users.findMany({
      where,
      orderBy: {
        id: order_by === '1' ? 'asc' : 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      status: 'success',
      data: users.map((user) => this.serializeUser(user)),
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  // --------------------------------------------------
  // NON VERIFIED CUSTOMERS
  // --------------------------------------------------

  async nonVerifiedCustomers(params: {
    keyword?: string;
    banned?: string;
    page?: number;
    limit?: number;
    order_by?: string;
  }) {
    const {
      keyword,
      banned,
      page = 1,
      limit = 15,
      order_by,
    } = params;

    const where: any = {
      role: 'student',
      email_verified_at: null,
    };

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { email: { contains: keyword } },
        { phone: { contains: keyword } },
        { address: { contains: keyword } },
      ];
    }

    if (banned === '1') {
      where.is_banned = 'yes';
    }

    if (banned === '0') {
      where.is_banned = 'no';
    }

    const total = await this.prisma.users.count({ where });

    const users = await this.prisma.users.findMany({
      where,
      orderBy: {
        id: order_by === '1' ? 'asc' : 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      status: 'success',
      data: users.map((user) => this.serializeUser(user)),
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  // --------------------------------------------------
  // BANNED CUSTOMERS
  // --------------------------------------------------

  async bannedCustomers(params: {
    keyword?: string;
    verified?: string;
    page?: number;
    limit?: number;
    order_by?: string;
  }) {
    const {
      keyword,
      verified,
      page = 1,
      limit = 15,
      order_by,
    } = params;

    const where: any = {
      role: 'student',
      is_banned: 'yes',
    };

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { email: { contains: keyword } },
        { phone: { contains: keyword } },
        { address: { contains: keyword } },
      ];
    }

    if (verified === '1') {
      where.email_verified_at = {
        not: null,
      };
    }

    if (verified === '0') {
      where.email_verified_at = null;
    }

    const total = await this.prisma.users.count({ where });

    const users = await this.prisma.users.findMany({
      where,
      orderBy: {
        id: order_by === '1' ? 'asc' : 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      status: 'success',
      data: users.map((user) => this.serializeUser(user)),
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  // --------------------------------------------------
  // SHOW CUSTOMER
  // --------------------------------------------------

async findOne(id: string) {
  const user = await this.findUser(id);
  const userId = BigInt(id);

  const experiences = await this.prisma.user_experiences.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      id: 'desc',
    },
  });

  const educations = await this.prisma.user_education.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      id: 'desc',
    },
  });

  const bannedHistories = await this.prisma.banned_histories.findMany({
    where: {
      user_id: Number(id),
    },
    orderBy: {
      id: 'desc',
    },
  });

  const enrollments = await this.prisma.enrollments.findMany({
    where: {
      user_id: userId,
    },
  });

  const courseIds = enrollments.map((item) => item.course_id);

  // Enrolled courses + instructor
  const enrolledCourses =
    courseIds.length > 0
      ? await this.prisma.courses.findMany({
          where: {
            id: {
              in: courseIds,
            },
          },
          include: {
            instructor: true,
          },
        })
      : [];

  const enrollmentData = enrollments.map((enrollment) => ({
    ...enrollment,
    id: enrollment.id.toString(),
    user_id: enrollment.user_id.toString(),
    course_id: enrollment.course_id.toString(),
    order_id: enrollment.order_id?.toString() ?? null,
    course:
      enrolledCourses.find(
        (course) => course.id === enrollment.course_id,
      ) ?? null,
  }));

  // Laravel:
  // State::where([
  //   'country_id' => $user->country_id,
  //   'status' => 1
  // ])->get();

  const states = user.country_id
    ? await this.prisma.states.findMany({
        where: {
          country_id: user.country_id,
          status: true,
        },
      })
    : [];

  // Laravel:
  // City::where([
  //   'state_id' => $user->state_id,
  //   'status' => 1
  // ])->get();

  const cities =
    user.state && !isNaN(Number(user.state))
      ? await this.prisma.cities.findMany({
          where: {
            state_id: BigInt(user.state),
            status: true,
          },
        })
      : [];

  // Laravel:
  // Course::orderBy('title')->get();

  const allCourses = await this.prisma.courses.findMany({
    orderBy: {
      title: 'asc',
    },
  });

  return {
    status: 'success',
    data: {
      user: this.serializeUser(user),

      experiences: experiences.map((item) => ({
        ...item,
        id: item.id.toString(),
        user_id: item.user_id.toString(),
      })),

      educations: educations.map((item) => ({
        ...item,
        id: item.id.toString(),
        user_id: item.user_id.toString(),
      })),

      banned_histories: bannedHistories.map((item) => ({
        ...item,
        id: item.id.toString(),
        user_id: item.user_id,
      })),

      enrollments: enrollmentData,

      states: states.map((item) => ({
        ...item,
        id: item.id.toString(),
        country_id: item.country_id.toString(),
      })),

      cities: cities.map((item) => ({
        ...item,
        id: item.id.toString(),
        state_id: item.state_id.toString(),
      })),

      courses: allCourses.map((course) => ({
        ...course,
        id: course.id.toString(),
        instructor_id: course.instructor_id.toString(),
      })),
    },
  };
}

  // --------------------------------------------------
  // UPDATE CUSTOMER
  // --------------------------------------------------

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findUser(id);

    const existingEmail = await this.prisma.users.findFirst({
      where: {
        email: dto.email,
        NOT: {
          id: BigInt(id),
        },
      },
    });

    if (existingEmail) {
      throw new BadRequestException('Email already exist');
    }

    if (dto.phone) {
  const existingPhone = await this.prisma.users.findFirst({
    where: {
      phone: dto.phone,
      NOT: {
        id: BigInt(id),
      },
    },
  });

  if (existingPhone) {
    throw new BadRequestException('Phone already exist');
  }
}

    const user = await this.prisma.users.update({
      where: {
        id: BigInt(id),
      },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        age: dto.age,
        gender: dto.gender as any,
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Updated Successfully',
      data: this.serializeUser(user),
    };
  }

  // --------------------------------------------------
  // BIO UPDATE
  // --------------------------------------------------

  async updateBio(id: string, dto: UpdateCustomerBioDto) {
    await this.findUser(id);

    const user = await this.prisma.users.update({
      where: {
        id: BigInt(id),
      },
      data: {
        job_title: dto.designation,
        bio: dto.bio,
        short_bio: dto.short_bio,
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Updated Successfully',
      data: this.serializeUser(user),
    };
  }

  // --------------------------------------------------
  // LOCATION UPDATE
  // --------------------------------------------------

  async updateLocation(
    id: string,
    dto: UpdateCustomerLocationDto,
  ) {
    await this.findUser(id);

    const user = await this.prisma.users.update({
      where: {
        id: BigInt(id),
      },
      data: {
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country_id: BigInt(dto.country),
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Updated Successfully',
      data: this.serializeUser(user),
    };
  }

  // --------------------------------------------------
  // SOCIAL UPDATE
  // --------------------------------------------------

  async updateSocial(
    id: string,
    dto: UpdateCustomerSocialDto,
  ) {
    await this.findUser(id);

    const user = await this.prisma.users.update({
      where: {
        id: BigInt(id),
      },
      data: {
        facebook: dto.facebook,
        twitter: dto.twitter,
        linkedin: dto.linkedin,
        website: dto.website,
        github: dto.github,
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Updated Successfully',
      data: this.serializeUser(user),
    };
  }

  // --------------------------------------------------
  // PASSWORD CHANGE
  // --------------------------------------------------

  async changePassword(
    id: string,
    dto: ChangeCustomerPasswordDto,
  ) {
    if (dto.password !== dto.confirm_password) {
      throw new BadRequestException(
        'Confirm password does not match',
      );
    }

    await this.findUser(id);

    const hashedPassword = await bcrypt.hash(
      dto.password,
      10,
    );

    await this.prisma.users.update({
      where: {
        id: BigInt(id),
      },
      data: {
        password: hashedPassword,
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Password change successfully',
    };
  }

  // --------------------------------------------------
  // BAN / UNBAN
  // --------------------------------------------------

  async toggleBan(id: string, dto: CustomerBanDto) {
    const user = await this.findUser(id);

    const banned = user.is_banned === 'yes';

    const newStatus = banned ? 'no' : 'yes';
    const reason = banned ? 'for_unbanned' : 'for_banned';

    const updatedUser = await this.prisma.users.update({
      where: {
        id: BigInt(id),
      },
      data: {
        is_banned: newStatus,
        updated_at: new Date(),
      },
    });

    await this.prisma.banned_histories.create({
      data: {
        user_id: Number(id),
        subject: dto.subject,
        reasone: reason,
        description: dto.description,
      },
    });

    return {
      status: 'success',
      message: 'Banned request successfully',
      data: this.serializeUser(updatedUser),
    };
  }

  // --------------------------------------------------
  // MANUAL VERIFY
  // --------------------------------------------------

  async verifyAccountManually(id: string) {
    await this.findUser(id);

    const user = await this.prisma.users.update({
      where: {
        id: BigInt(id),
      },
      data: {
        email_verified_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'The user account has been successfully verified.',
      data: this.serializeUser(user),
    };
  }

  // --------------------------------------------------
  // SEND VERIFY REQUEST
  // --------------------------------------------------

  async sendVerifyRequest(id: string) {
    const user = await this.findUser(id);

    const token = randomBytes(50)
      .toString('hex')
      .slice(0, 100);

    const updatedUser = await this.prisma.users.update({
      where: {
        id: BigInt(id),
      },
      data: {
        verification_token: token,
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message:
        'A verification link has been generated successfully.',
      data: {
        id: updatedUser.id.toString(),
        email: updatedUser.email,
        verification_token: token,
      },
    };
  }

  // --------------------------------------------------
  // ENROLL STUDENT
  // --------------------------------------------------

  async enrollStudent(
    id: string,
    dto: EnrollStudentDto,
  ) {
    const user = await this.findUser(id);

    const course = await this.prisma.courses.findUnique({
      where: {
        id: BigInt(dto.course_id),
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const alreadyEnrolled =
      await this.prisma.enrollments.findFirst({
        where: {
          user_id: user.id,
          course_id: course.id,
        },
      });

    if (alreadyEnrolled) {
      throw new BadRequestException(
        'Student is already enrolled in this course!',
      );
    }

    const order = await this.prisma.orders.create({
      data: {
        buyer_id: user.id,
        payment_method: 'admin_enroll',
        payment_status: 'paid',
        paid_amount: 0,
        payable_amount: 0,
        payable_with_charge: 0,
        transaction_id: `ADMIN-ENROLL-${Date.now()}`,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    const enrollment =
      await this.prisma.enrollments.create({
        data: {
          user_id: user.id,
          course_id: course.id,
          order_id: order.id,
          has_access: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

    return {
      status: 'success',
      message: 'Student enrolled successfully!',
      data: {
        enrollment_id: enrollment.id.toString(),
        order_id: order.id.toString(),
        user_id: user.id.toString(),
        course_id: course.id.toString(),
      },
    };
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  async remove(id: string) {
    const user = await this.findUser(id);

    // Laravel prevents deleting instructor if courses exist.
    // For customer/student, it prevents delete if orders exist.

    if (user.role === 'student') {
      const ordersCount = await this.prisma.orders.count({
        where: {
          buyer_id: user.id,
        },
      });

      if (ordersCount > 0) {
        throw new BadRequestException(
          'A student cannot be deleted because he has purchased course.',
        );
      }
    }

    await this.prisma.users.delete({
      where: {
        id: user.id,
      },
    });

    return {
      status: 'success',
      message: 'User deleted successfully',
    };
  }

  async createInstructor(dto: CreateInstructorDto) {
  const existingUser = await this.prisma.users.findFirst({
    where: {
      email: dto.email,
    },
  });

  if (existingUser) {
    throw new BadRequestException('Email already exist');
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const instructor = await this.prisma.users.create({
    data: {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: 'instructor',
      status: dto.status,
      email_verified_at: new Date(),
      is_banned: 'no',
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return {
    message: 'Instructor created successfully',
    instructor: {
      id: instructor.id.toString(),
      name: instructor.name,
      email: instructor.email,
      role: instructor.role,
      status: instructor.status,
    },
  };
}

async getAllInstructors(query: any) {
  const {
    keyword,
    verified,
    banned,
    order_by,
    page = 1,
    limit = 10,
  } = query;

  const where: any = {
    role: 'instructor',
  };

  if (keyword) {
    where.OR = [
      {
        name: {
          contains: keyword,
        },
      },
      {
        email: {
          contains: keyword,
        },
      },
      {
        phone: {
          contains: keyword,
        },
      },
      {
        address: {
          contains: keyword,
        },
      },
    ];
  }

  if (verified !== undefined) {
    if (String(verified) === '1') {
      where.email_verified_at = {
        not: null,
      };
    } else if (String(verified) === '0') {
      where.email_verified_at = null;
    }
  }

  if (banned !== undefined) {
    if (String(banned) === '1') {
      where.is_banned = 'yes';
    } else if (String(banned) === '0') {
      where.is_banned = 'no';
    }
  }

  const take = Number(limit);
  const skip = (Number(page) - 1) * take;

  const [instructors, total] = await Promise.all([
    this.prisma.users.findMany({
      where,
      orderBy: {
        id: String(order_by) === '1' ? 'asc' : 'desc',
      },
      skip,
      take,
    }),

    this.prisma.users.count({
      where,
    }),
  ]);

  return {
    data: instructors.map((instructor) => ({
      ...instructor,
      id: instructor.id.toString(),
      country_id: instructor.country_id?.toString() ?? null,
      wallet_balance: instructor.wallet_balance.toString(),
    })),
    pagination: {
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
}
async updateInstructor(id: string, dto: UpdateCustomerDto) {
  const instructor = await this.prisma.users.findFirst({
    where: {
      id: BigInt(id),
      role: 'instructor',
    },
  });

  if (!instructor) {
    throw new NotFoundException('Instructor not found');
  }

  const existingEmail = await this.prisma.users.findFirst({
    where: {
      email: dto.email,
      NOT: {
        id: BigInt(id),
      },
    },
  });

  if (existingEmail) {
    throw new BadRequestException('Email already exist');
  }

  if (dto.phone) {
    const existingPhone = await this.prisma.users.findFirst({
      where: {
        phone: dto.phone,
        NOT: {
          id: BigInt(id),
        },
      },
    });

    if (existingPhone) {
      throw new BadRequestException('Phone already exist');
    }
  }

  const updatedInstructor = await this.prisma.users.update({
    where: {
      id: BigInt(id),
    },
    data: {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      age: dto.age,
      gender: dto.gender as any,
      updated_at: new Date(),
    },
  });

  return {
    message: 'Updated Successfully',
    instructor: {
      ...updatedInstructor,
      id: updatedInstructor.id.toString(),
      country_id: updatedInstructor.country_id?.toString() ?? null,
      wallet_balance: updatedInstructor.wallet_balance.toString(),
    },
  };
}

async deleteInstructor(id: string) {
  const instructor = await this.prisma.users.findFirst({
    where: {
      id: BigInt(id),
      role: 'instructor',
    },
  });

  if (!instructor) {
    throw new NotFoundException('Instructor not found');
  }

  const coursesExist = await this.prisma.courses.findFirst({
    where: {
      instructor_id: BigInt(id),
    },
    select: {
      id: true,
    },
  });

  if (coursesExist) {
    throw new BadRequestException(
      'Instructor can not be deleted. Instructor has courses',
    );
  }

  await this.prisma.users.delete({
    where: {
      id: BigInt(id),
    },
  });

  return {
    message: 'User deleted successfully',
  };
}

async getInstructorById(id: string) {
  const instructor = await this.prisma.users.findFirst({
    where: {
      id: BigInt(id),
      role: 'instructor',
    },
  });

  if (!instructor) {
    throw new NotFoundException('Instructor not found');
  }

  return {
    ...instructor,
    id: instructor.id.toString(),
    country_id: instructor.country_id?.toString() ?? null,
    wallet_balance: instructor.wallet_balance.toString(),
  };
}

async createExperience(
  userId: string,
  dto: CreateCustomerExperienceDto,
) {
  const user = await this.prisma.users.findUnique({
    where: {
      id: BigInt(userId),
    },
  });

  if (!user) {
    throw new NotFoundException('Customer not found');
  }

  const experience = await this.prisma.user_experiences.create({
    data: {
      user_id: BigInt(userId),
      company: dto.company,
      position: dto.position,
      start_date: new Date(dto.start_date),
      end_date: dto.end_date ? new Date(dto.end_date) : null,
      current: dto.current ? 1 : 0,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return {
    message: 'Experience added successfully',
    experience: {
      ...experience,
      id: experience.id.toString(),
      user_id: experience.user_id.toString(),
    },
  };
}


async updateExperience(
  experienceId: string,
  dto: UpdateCustomerExperienceDto,
) {
  const experience = await this.prisma.user_experiences.findUnique({
    where: {
      id: BigInt(experienceId),
    },
  });

  if (!experience) {
    throw new NotFoundException('Experience not found');
  }

  const updatedExperience = await this.prisma.user_experiences.update({
    where: {
      id: BigInt(experienceId),
    },
    data: {
      company: dto.company,
      position: dto.position,
      start_date: new Date(dto.start_date),
      end_date: dto.end_date ? new Date(dto.end_date) : null,
      current: dto.current ? 1 : 0,
      updated_at: new Date(),
    },
  });

  return {
    message: 'Experience updated successfully',
    experience: {
      ...updatedExperience,
      id: updatedExperience.id.toString(),
      user_id: updatedExperience.user_id.toString(),
    },
  };
}


async deleteExperience(experienceId: string) {
  const experience = await this.prisma.user_experiences.findUnique({
    where: {
      id: BigInt(experienceId),
    },
  });

  if (!experience) {
    throw new NotFoundException('Experience not found');
  }

  await this.prisma.user_experiences.delete({
    where: {
      id: BigInt(experienceId),
    },
  });

  return {
    message: 'Experience deleted successfully',
  };
}

async getExperiences(userId: string) {
  const user = await this.prisma.users.findUnique({
    where: {
      id: BigInt(userId),
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new NotFoundException('Customer not found');
  }

  const experiences = await this.prisma.user_experiences.findMany({
    where: {
      user_id: BigInt(userId),
    },
    orderBy: {
      id: 'desc',
    },
  });

  return {
    experiences: experiences.map((experience) => ({
      ...experience,
      id: experience.id.toString(),
      user_id: experience.user_id.toString(),
    })),
  };
}

async getExperienceById(userId: string, experienceId: string) {
  const experience = await this.prisma.user_experiences.findFirst({
    where: {
      id: BigInt(experienceId),
      user_id: BigInt(userId),
    },
  });

  if (!experience) {
    throw new NotFoundException('Experience not found');
  }

  return {
    ...experience,
    id: experience.id.toString(),
    user_id: experience.user_id.toString(),
  };
}

async createEducation(
  userId: string,
  dto: CreateCustomerEducationDto,
) {
  const user = await this.prisma.users.findUnique({
    where: {
      id: BigInt(userId),
    },
  });

  if (!user) {
    throw new NotFoundException('Customer not found');
  }

  const education = await this.prisma.user_education.create({
    data: {
      user_id: BigInt(userId),
      organization: dto.organization,
      degree: dto.degree,
      start_date: new Date(dto.start_date),
      end_date: dto.end_date ? new Date(dto.end_date) : null,
      current: dto.current ? 1 : 0,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return {
    message: 'Education added successfully',
    education: {
      ...education,
      id: education.id.toString(),
      user_id: education.user_id.toString(),
    },
  };
}

async getEducations(userId: string) {
  const user = await this.prisma.users.findUnique({
    where: {
      id: BigInt(userId),
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new NotFoundException('Customer not found');
  }

  const educations = await this.prisma.user_education.findMany({
    where: {
      user_id: BigInt(userId),
    },
    orderBy: {
      id: 'desc',
    },
  });

  return {
    educations: educations.map((education) => ({
      ...education,
      id: education.id.toString(),
      user_id: education.user_id.toString(),
    })),
  };
}
async getEducationById(
  userId: string,
  educationId: string,
) {
  const education = await this.prisma.user_education.findFirst({
    where: {
      id: BigInt(educationId),
      user_id: BigInt(userId),
    },
  });

  if (!education) {
    throw new NotFoundException('Education not found');
  }

  return {
    ...education,
    id: education.id.toString(),
    user_id: education.user_id.toString(),
  };
}

async updateEducation(
  userId: string,
  educationId: string,
  dto: UpdateCustomerEducationDto,
) {
  const education = await this.prisma.user_education.findFirst({
    where: {
      id: BigInt(educationId),
      user_id: BigInt(userId),
    },
  });

  if (!education) {
    throw new NotFoundException('Education not found');
  }

  const updatedEducation = await this.prisma.user_education.update({
    where: {
      id: BigInt(educationId),
    },
    data: {
      organization: dto.organization,
      degree: dto.degree,
      start_date: new Date(dto.start_date),
      end_date: dto.end_date ? new Date(dto.end_date) : null,
      current: dto.current ? 1 : 0,
      updated_at: new Date(),
    },
  });

  return {
    message: 'Education updated successfully',
    education: {
      ...updatedEducation,
      id: updatedEducation.id.toString(),
      user_id: updatedEducation.user_id.toString(),
    },
  };
}

async deleteEducation(
  userId: string,
  educationId: string,
) {
  const education = await this.prisma.user_education.findFirst({
    where: {
      id: BigInt(educationId),
      user_id: BigInt(userId),
    },
  });

  if (!education) {
    throw new NotFoundException('Education not found');
  }

  await this.prisma.user_education.delete({
    where: {
      id: BigInt(educationId),
    },
  });

  return {
    message: 'Education deleted successfully',
  };
}

async removeEnrollment(
  userId: string,
  enrollmentId: string,
) {
  const enrollment = await this.prisma.enrollments.findFirst({
    where: {
      id: BigInt(enrollmentId),
      user_id: BigInt(userId),
    },
  });

  if (!enrollment) {
    throw new NotFoundException('Enrollment not found');
  }

  await this.prisma.enrollments.delete({
    where: {
      id: BigInt(enrollmentId),
    },
  });

  return {
    message: 'Enrollment removed successfully',
  };
}

async sendVerifyRequestToAll() {
  const users = await this.prisma.users.findMany({
    where: {
      email: {
        not: null,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  let sentCount = 0;
  let failedCount = 0;



  for (const user of users) {
    if (!user.email) {
      continue;
    }

    try {
      const verificationToken = randomBytes(50).toString('hex');

      await this.prisma.users.update({
        where: {
          id: user.id,
        },
        data: {
          verification_token: verificationToken,
          updated_at: new Date(),
        },
      });


      const mailResult = await this.mailService.sendMail({
        to: user.email,
        subject: 'Verify Your Email',
        html: `
          <p>Hello ${user.name},</p>

          <p>Please verify your email address by clicking the link below:</p>

          <p>
            <a href="${process.env.FRONTEND_URL}/verify-email/${verificationToken}">
              Verify Email
            </a>
          </p>

          <p>If you did not request this, please ignore this email.</p>
        `,
      });


      sentCount++;
    } catch (error) {
      failedCount++;

      console.error(
        `Failed to send verification email to ${user.email}`,
        error,
      );
      continue;
    }
  }


  return {
    message: 'Verification mail process completed',
    totalUsers: users.length,
    sentCount,
    failedCount,
  };
}


async sendMailToCustomer(id: string, dto: SendCustomerMailDto) {
  const user = await this.prisma.users.findUnique({
    where: {
      id: BigInt(id),
    },
  });

  if (!user) {
    throw new NotFoundException('Customer not found');
  }

  await this.mailService.sendMail({
    to: user.email!,
    subject: dto.subject,
    html: dto.description,
  });

  return {
    message: 'Mail send to customer successfully',
  };
}

async sendBulkMailToAll(dto: SendBulkCustomerMailDto) {
  const users = await this.prisma.users.findMany({
    where: {
      status: 'active',
      is_banned: 'no',
      email_verified_at: {
        not: null,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      id: 'desc',
    },
  });

  let sentCount = 0;
  let failedCount = 0;

  console.log(`Found ${users.length} eligible users.`);

  for (const user of users) {
    if (!user.email) {
      continue;
    }

    try {
      console.log(`Sending bulk email to ${user.email}`);

      await this.mailService.sendMail({
        to: user.email,
        subject: dto.subject,
        html: dto.description,
      });

      sentCount++;

      console.log(`Mail sent successfully to ${user.email}`);
    } catch (error) {
      failedCount++;

      console.error(
        `Failed to send bulk email to ${user.email}`,
        error,
      );

      continue;
    }
  }

  console.log(`Bulk emails sent: ${sentCount}`);
  console.log(`Bulk emails failed: ${failedCount}`);

  return {
    message: 'Mail send to customers successfully',
    totalUsers: users.length,
    sentCount,
    failedCount,
  };
}



}