import {
  get,
  post,
  patch,
  del,
} from '../../../services/api';

import type {
  Course,
  CourseFilterState,
} from '../types/course.types';

/* =========================================================
   API TYPES
========================================================= */

export interface CoursesApiResponse {
  status: string;
  data: any[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface CourseMetricCounts {
  published: number;
  pendingReview: number;
  draft: number;
  archived: number;
}

/* =========================================================
   DEFAULT FILTERS
========================================================= */

export const DEFAULT_FILTERS: CourseFilterState = {
  search: '',
  date: '',
  category: 'All Categories',
  instructor: 'All Instructors',
  level: 'All Levels',
  language: 'All Languages',
  status: 'All Status',
  approvalStatus: 'All Approval Status',
  courseType: 'Course Type',
  orderBy: 'newest',
  perPage: 10,
};

/* =========================================================
   API QUERY PARAMS
========================================================= */

export const buildCourseParams = (
  filters: CourseFilterState,
  page: number,
  perPage: number | string,
  statusOverride?: string,
): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set('keyword', filters.search.trim());
  }

  if (
    filters.category &&
    filters.category !== 'All Categories'
  ) {
    params.set('category', filters.category);
  }

  if (filters.date) {
    params.set('date', filters.date);
  }

  if (
    filters.approvalStatus &&
    filters.approvalStatus !== 'All Approval Status'
  ) {
    params.set(
      'approve_status',
      filters.approvalStatus,
    );
  }

  const effectiveStatus =
    statusOverride ??
    (
      filters.status &&
      filters.status !== 'All Status'
        ? filters.status
        : ''
    );

  if (effectiveStatus) {
    params.set('status', effectiveStatus);
  }

  if (
    filters.instructor &&
    filters.instructor !== 'All Instructors'
  ) {
    params.set('instructor', filters.instructor);
  }

  if (
    filters.level &&
    filters.level !== 'All Levels'
  ) {
    params.set('level', filters.level);
  }

  if (
    filters.language &&
    filters.language !== 'All Languages'
  ) {
    params.set('language', filters.language);
  }

  if (
    filters.courseType &&
    filters.courseType !== 'Course Type'
  ) {
    params.set('type', filters.courseType);
  }

  params.set('page', String(page));
  params.set('par_page', String(perPage));

  if (filters.orderBy === 'oldest') {
    params.set('order_by', '1');
  } else {
    params.set('order_by', '0');
  }

  return params;
};

/* =========================================================
   MAP API COURSE -> FRONTEND COURSE
========================================================= */

export const mapApiCourse = (
  course: any,
  index: number,
): Course => {
  const instructorName =
    course?.instructor?.name ??
    course?.instructor_name ??
    '';

  const instructorId =
    course?.instructor_id ??
    course?.instructor?.id ??
    '';

  const categoryId =
    course?.category_id ??
    course?.category?.id ??
    '';

  const studentsCount = Number(
    course?.students ??
      course?.enrollments_count ??
      0,
  );

  const rating = Number(
    course?.rating ?? 0,
  );

  const price = Number(
    course?.price ?? 0,
  );

  const createdAt = course?.created_at
    ? new Date(course.created_at)
    : null;

  return {
    id: String(course?.id ?? ''),
    sn: Number(
      course?.id ?? index + 1,
    ),

    title: course?.title ?? '',

    subtitle:
      course?.subtitle ??
      course?.seo_description ??
      '',

    thumbnail:
      course?.thumbnail ?? '',

    instructorName,

    instructorAvatar:
      course?.instructor_avatar ??
      course?.instructor?.avatar ??
      '',

    category:
      course?.category?.name ??
      course?.category_name ??
      String(categoryId),

    level:
      course?.level ?? '',

    studentsCount,

    price,

    isFree: price <= 0,

    status:
      course?.status ??
      'Draft',

    approvalStatus:
      course?.approval_status ??
      course?.is_approved ??
      'Pending',

    courseType:
      course?.course_type ??
      'Course',

    language:
      course?.language ?? '',

    duration:
      course?.duration ?? '',

    lessonsCount: Number(
      course?.lessons_count ??
        course?.lessonsCount ??
        0,
    ),

    rating,

    description:
      course?.description ?? '',

    // SEO fields
    metaTitle:
      course?.meta_title ??
      course?.metaTitle ??
      '',
    metaDescription:
      course?.seo_description ??
      course?.meta_description ??
      course?.metaDescription ??
      '',

    createdDate: createdAt
      ? createdAt.toLocaleDateString()
      : '',

    createdTime: createdAt
      ? createdAt.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '',

    instructorId,
    categoryId,
  } as Course;
};

/* =========================================================
   GET COURSES
========================================================= */

export const getCourses = async (
  filters: CourseFilterState,
  page: number,
): Promise<CoursesApiResponse> => {
  const params = buildCourseParams(
    filters,
    page,
    filters.perPage,
  );

  return (await get(
    `/admin/courses?${params.toString()}`,
  )) as CoursesApiResponse;
};

/* =========================================================
   GET COURSE METRIC COUNTS
========================================================= */

export const getCourseMetricCounts = async (
  filters: CourseFilterState,
): Promise<CourseMetricCounts> => {
  const statuses = [
    {
      key: 'published' as const,
      value: 'Published',
    },
    {
      key: 'pendingReview' as const,
      value: 'Pending Review',
    },
    {
      key: 'draft' as const,
      value: 'Draft',
    },
    {
      key: 'archived' as const,
      value: 'Archived',
    },
  ];

  const results = await Promise.all(
    statuses.map(
      async ({ key, value }) => {
        const params = buildCourseParams(
          filters,
          1,
          1,
          value,
        );

        const response =
          (await get(
            `/admin/courses?${params.toString()}`,
          )) as CoursesApiResponse;

        return {
          key,
          count: Number(
            response?.meta?.total ?? 0,
          ),
        };
      },
    ),
  );

  const counts: CourseMetricCounts = {
    published: 0,
    pendingReview: 0,
    draft: 0,
    archived: 0,
  };

  results.forEach(
    ({ key, count }) => {
      counts[key] = count;
    },
  );

  return counts;
};

/* =========================================================
   CREATE COURSE
========================================================= */

export interface CreateCourseData {
  title: string;

  instructorId: number;
  categoryId: number;

  thumbnail: string;

  subtitle?: string;
  description?: string;

  metaTitle?: string;
  metaDescription?: string;

  demo_video_source?: string;

  price?: number;
  discount_price?: number;

  status?: string;
  approval_status?: string;
}

export const createCourse = async (
  data: CreateCourseData,
) => {
  const instructorId = Number(
    data.instructorId,
  );

  const categoryId = Number(
    data.categoryId,
  );

  const thumbnail =
    data.thumbnail?.trim() || '';

  const description =
    data.description?.trim() || '';

  const metaTitle =
    data.metaTitle?.trim() || '';

  const metaDescription =
    data.metaDescription?.trim() || '';

  const status =
    data.status || 'Draft';

  const approvalStatus =
    data.approval_status ||
    'Pending';

  /* -----------------------------
     VALIDATION
  ----------------------------- */

  if (
    !Number.isInteger(instructorId) ||
    instructorId <= 0
  ) {
    throw new Error(
      'Please select a valid instructor.',
    );
  }

  if (
    !Number.isInteger(categoryId) ||
    categoryId <= 0
  ) {
    throw new Error(
      'Please select a valid category.',
    );
  }

  if (!thumbnail) {
    throw new Error(
      'Please enter a course thumbnail URL.',
    );
  }

  if (thumbnail.length > 255) {
    throw new Error(
      'Thumbnail URL must be 255 characters or less.',
    );
  }

  if (!description) {
    throw new Error(
      'Please enter a course description.',
    );
  }

  if (metaTitle.length > 255) {
    throw new Error(
      'Meta title must be 255 characters or less.',
    );
  }

  if (metaDescription.length > 255) {
    throw new Error(
      'Meta description must be 255 characters or less.',
    );
  }

  /* -----------------------------
     PAYLOAD
  ----------------------------- */

  const payload = {
    title: data.title.trim(),

    instructor: instructorId,

    category: categoryId,

    thumbnail,

    meta_title:
      metaTitle || undefined,

    seo_description:
      metaDescription ||
      data.subtitle?.trim() ||
      description ||
      undefined,

    demo_video_source:
      data.demo_video_source ||
      undefined,

    price: Number(
      data.price ?? 0,
    ),

    discount_price:
      data.discount_price != null
        ? Number(
            data.discount_price,
          )
        : undefined,

    description,

    status,

    approval_status:
      approvalStatus,
  };

  console.log(
    'CREATE COURSE PAYLOAD:',
    payload,
  );

  return await post(
    '/admin/courses',
    payload,
  );
};

/* =========================================================
   UPDATE COURSE
========================================================= */

export const updateCourse = async (
  updated: Course,
) => {
  const metaTitle =
    String(
      (updated as any).metaTitle ??
      (updated as any).meta_title ??
      '',
    ).trim();

  const metaDescription =
    String(
      (updated as any).metaDescription ??
      (updated as any).seo_description ??
      '',
    ).trim();

  const status =
    String(
      (updated as any).status ??
      'Draft',
    );

  const approvalStatus =
    String(
      (updated as any).approvalStatus ??
      (updated as any).approval_status ??
      'Pending',
    );

  const payload = {
    title: updated.title,

    instructor: Number(
      (updated as any).instructorId ?? 0,
    ),

    category: Number(
      (updated as any).categoryId ?? 0,
    ),

    thumbnail:
      updated.thumbnail || null,

    // SEO
    meta_title:
      metaTitle || undefined,

    seo_description:
      metaDescription ||
      updated.subtitle ||
      updated.description ||
      undefined,

    demo_video_source:
      (updated as any)
        .demo_video_source ?? undefined,

    price: Number(
      updated.price ?? 0,
    ),

    discount_price:
      (updated as any)
        .discount_price != null
        ? Number(
            (updated as any).discount_price,
          )
        : undefined,

    description:
      updated.description || '',

    // Publication status
    status,

    // Approval status
    approval_status:
      approvalStatus,
  };

  console.log(
    'UPDATE COURSE PAYLOAD:',
    payload,
  );

  return await patch(
    `/admin/courses/${updated.id}`,
    payload,
  );
};

/* =========================================================
   DELETE COURSE
========================================================= */

export const deleteCourse = async (
  id: string,
) => {
  return await del(
    `/admin/courses/${id}`,
  );
};

/* =========================================================
   BULK DELETE COURSES
========================================================= */

export const bulkDeleteCourses = async (
  ids: string[],
) => {
  return await Promise.all(
    ids.map((id) =>
      deleteCourse(id),
    ),
  );
};

export interface CourseLesson {
  id: string;
  title: string;
  description?: string | null;
  duration?: string | null;
  file_type?: string | null;
  file_path?: string | null;
  downloadable?: boolean;
  is_free?: boolean | null;
  order?: number | null;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CourseChapter {
  id: string;
  course_id: string;
  instructor_id: string;
  title: string;
  order: number;
  status: string;
  lessons: CourseLesson[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CourseChaptersResponse {
  status: string;
  data: CourseChapter[];
}

export const getCourseChapters = async (
  courseId: string | number,
): Promise<CourseChaptersResponse> => {
  return await get<CourseChaptersResponse>(
    `/admin/courses/${courseId}/chapters`,
  );
};