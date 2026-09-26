import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  X,
  Plus,
  Loader2,
  RefreshCw,
  ImagePlus,
} from 'lucide-react';

import type {
  Course,
  CourseStatus,
  ApprovalStatus,
  CourseType,
} from '../types/course.types';

import { get } from '../../../services/api';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (
    course: Omit<
      Course,
      'id' | 'sn' | 'createdDate' | 'createdTime'
    >,
  ) => void;
}

interface CategoryTranslation {
  id?: string;
  course_category_id?: string;
  lang_code?: string;
  name?: string;
}

interface Category {
  id: string;
  slug?: string;
  status?: boolean;
  translations?: CategoryTranslation[];
}

interface Instructor {
  id: string;
  name: string;
  email?: string;
  role?: string;
  status?: string;
}

interface CourseLevel {
  id: string | number;
  name?: string;
  slug?: string;
  status?: boolean | number | string;
}

interface CourseLevelsApiResponse {
  data: CourseLevel[];
  meta?: {
    current_page?: number;
    last_page?: number;
    total?: number;
  };
}

interface CourseLanguage {
  id: string | number;
  name?: string;
  slug?: string;
  code?: string;
  status?: boolean | number | string;
}

interface CourseLanguagesApiResponse {
  data: CourseLanguage[];
  meta?: {
    current_page?: number;
    last_page?: number;
    total?: number;
  };
}

interface CategoriesApiResponse {
  status: string;
  data: Category[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

interface InstructorsApiResponse {
  data: Instructor[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const AddCourseModal: React.FC<
  AddCourseModalProps
> = ({
  isOpen,
  onClose,
  onAddCourse,
}) => {
  // --------------------------------------------------
  // FORM STATE
  // --------------------------------------------------

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const [categoryId, setCategoryId] =
    useState('');

  const [instructorId, setInstructorId] =
    useState('');

  const [level, setLevel] = useState('');
  const [language, setLanguage] =
    useState('');

  const [isFree, setIsFree] =
    useState(true);

  const [price, setPrice] =
    useState<number>(0);

  const [discountPrice, setDiscountPrice] =
    useState<number>(0);

  const [status, setStatus] =
    useState<CourseStatus>('Draft');

  const [approvalStatus, setApprovalStatus] =
    useState<ApprovalStatus>('Pending');

  const [courseType, setCourseType] =
    useState<CourseType>('Standard');

  // --------------------------------------------------
  // THUMBNAIL
  // --------------------------------------------------

  const [thumbnailFile, setThumbnailFile] =
    useState<File | null>(null);

  const [thumbnailPreview, setThumbnailPreview] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [duration, setDuration] =
    useState('');

  const [lessonsCount, setLessonsCount] =
    useState<number>(0);

  // --------------------------------------------------
  // API STATE
  // --------------------------------------------------

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [instructors, setInstructors] =
    useState<Instructor[]>([]);

  const [levels, setLevels] =
    useState<CourseLevel[]>([]);

  const [languages, setLanguages] =
    useState<CourseLanguage[]>([]);

  const [isLoadingOptions, setIsLoadingOptions] =
    useState(false);

  const [optionsError, setOptionsError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // --------------------------------------------------
  // LOAD CATEGORIES + INSTRUCTORS
  // --------------------------------------------------

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      setOptionsError(null);

      try {
        const [
          categoryResponse,
          instructorResponse,
          levelResponse,
          languageResponse,
        ] = await Promise.all([
          get(
            '/admin/course-categories?par-page=100&status=1',
          ) as Promise<CategoriesApiResponse>,

          get(
            '/admin/customers/instructors?limit=100&page=1',
          ) as Promise<InstructorsApiResponse>,

          get(
            '/admin/course-levels?par-page=100',
          ) as Promise<CourseLevelsApiResponse>,

          get(
            '/admin/course-languages?par-page=100',
          ) as Promise<CourseLanguagesApiResponse>,
        ]);

        if (!isMounted) return;

        console.group('🟦 AddCourseModal - Course Options API');
        console.log('Category API response:', categoryResponse);
        console.log('Instructor API response:', instructorResponse);
        console.log('Course Level API response:', levelResponse);
        console.log('Course Language API response:', languageResponse);
        console.log('Course Level response.data:', levelResponse?.data);
        console.log('Course Language response.data:', languageResponse?.data);
        console.log(
          'Course Level response.data is array:',
          Array.isArray(levelResponse?.data),
        );
        console.log(
          'Course Level response keys:',
          levelResponse && typeof levelResponse === 'object'
            ? Object.keys(levelResponse)
            : 'not-an-object',
        );
        console.groupEnd();

        setCategories(
          Array.isArray(categoryResponse?.data)
            ? categoryResponse.data
            : [],
        );

        setInstructors(
          Array.isArray(instructorResponse?.data)
            ? instructorResponse.data
            : [],
        );

        const levelData = Array.isArray(levelResponse?.data)
          ? levelResponse.data
          : [];

        console.group('🟨 Course Levels Debug');
        console.log('Raw levelData:', levelData);
        console.log('Total levels received:', levelData.length);
        console.table(levelData);
        console.log(
          'Level names received:',
          levelData.map((item) => item?.name ?? item?.slug),
        );
        console.log(
          'Level statuses received:',
          levelData.map((item) => ({
            id: item?.id,
            name: item?.name ?? item?.slug,
            slug: item?.slug,
            status: item?.status,
            statusType: typeof item?.status,
          })),
        );
        console.groupEnd();

        // The Course Level list API may return status as boolean,
        // 1/0, or "true"/"false" depending on the service query.
        // Fetch all levels and keep only active ones here so the
        // dropdown does not become empty because of query parsing.
        const activeLevels = levelData.filter((level) => {
          const value = level?.status;

          return (
            value === undefined ||
            value === true ||
            value === 1 ||
            value === '1' ||
            value === 'true'
          );
        });

        console.group('🟩 Course Levels After Active Filter');
        console.log('Active levels:', activeLevels);
        console.log('Active level count:', activeLevels.length);
        console.table(activeLevels);
        console.groupEnd();

        setLevels(activeLevels);

        const languageData = Array.isArray(languageResponse?.data)
          ? languageResponse.data
          : [];

        const activeLanguages = languageData.filter((language) => {
          const value = language?.status;

          return (
            value === undefined ||
            value === true ||
            value === 1 ||
            value === '1' ||
            value === 'true'
          );
        });

        console.group('🟧 Course Languages Debug');
        console.log('Raw languageData:', languageData);
        console.log('Total languages received:', languageData.length);
        console.table(languageData);
        console.log(
          'Language names received:',
          languageData.map(
            (item) => item?.name ?? item?.slug ?? item?.code,
          ),
        );
        console.log('Active languages:', activeLanguages);
        console.log(
          'Active language count:',
          activeLanguages.length,
        );
        console.table(activeLanguages);
        console.groupEnd();

        setLanguages(activeLanguages);
      } catch (error: any) {
        console.error(
          'Failed to load course options:',
          error,
        );

        if (!isMounted) return;

        setOptionsError(
          Array.isArray(
            error?.response?.data?.message,
          )
            ? error.response.data.message.join(', ')
            : error?.response?.data?.message ??
                error?.message ??
                'Failed to load categories, instructors and course levels.',
        );

        setCategories([]);
        setInstructors([]);
        setLevels([]);
        setLanguages([]);
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false);
        }
      }
    };

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    console.log('🟪 Course Levels state updated:', levels);
    console.log('🟪 Course Levels state count:', levels.length);
  }, [levels]);

  useEffect(() => {
    console.log('🟧 Course Languages state updated:', languages);
    console.log('🟧 Course Languages state count:', languages.length);
  }, [languages]);

  // --------------------------------------------------
  // CATEGORY NAME
  // --------------------------------------------------

  const getCategoryName = (
    category: Category,
  ) => {
    const translation =
      category.translations?.find(
        (item) =>
          item.lang_code === 'en',
      ) ??
      category.translations?.[0];

    return (
      translation?.name ??
      category.slug ??
      `Category ${category.id}`
    );
  };

  const getLevelName = (levelItem: CourseLevel) => {
    if (levelItem.name?.trim()) {
      return levelItem.name.trim();
    }

    const slug = levelItem.slug?.trim();

    if (!slug) {
      return `Level ${levelItem.id}`;
    }

    const knownNames: Record<string, string> = {
      beginner: 'Beginner',
      intermed: 'Intermediate',
      intermediate: 'Intermediate',
      expert: 'Expert',
    };

    if (knownNames[slug.toLowerCase()]) {
      return knownNames[slug.toLowerCase()];
    }

    return slug
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getLanguageName = (languageItem: CourseLanguage) => {
    return (
      languageItem.name ??
      languageItem.slug ??
      languageItem.code ??
      `Language ${languageItem.id}`
    );
  };

  // --------------------------------------------------
  // SELECTED ITEMS
  // --------------------------------------------------

  const selectedInstructor = useMemo(
    () =>
      instructors.find(
        (instructor) =>
          String(instructor.id) ===
          String(instructorId),
      ),
    [instructors, instructorId],
  );

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) =>
          String(category.id) ===
          String(categoryId),
      ),
    [categories, categoryId],
  );

  // --------------------------------------------------
  // DISCOUNT %
  // --------------------------------------------------

  const discountPercentage = useMemo(() => {
    if (
      isFree ||
      price <= 0 ||
      discountPrice <= 0 ||
      discountPrice >= price
    ) {
      return 0;
    }

    return Math.round(
      ((price - discountPrice) / price) *
        100,
    );
  }, [
    isFree,
    price,
    discountPrice,
  ]);

  // --------------------------------------------------
  // THUMBNAIL SELECT
  // --------------------------------------------------

  const handleThumbnailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        'Please select a JPG, PNG or WEBP image.',
      );

      e.target.value = '';
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        'Thumbnail image must be less than 5 MB.',
      );

      e.target.value = '';
      return;
    }

    setThumbnailFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setThumbnailPreview(previewUrl);
  };

  // --------------------------------------------------
  // PRICE
  // --------------------------------------------------

  const handlePriceChange = (
    value: number,
  ) => {
    const safeValue = Math.max(
      0,
      Number.isFinite(value)
        ? value
        : 0,
    );

    setPrice(safeValue);

    if (
      discountPrice > safeValue &&
      safeValue > 0
    ) {
      setDiscountPrice(0);
    }
  };

  const handleDiscountPriceChange = (
    value: number,
  ) => {
    const safeValue = Math.max(
      0,
      Number.isFinite(value)
        ? value
        : 0,
    );

    setDiscountPrice(safeValue);
  };

  // --------------------------------------------------
  // FREE / PAID
  // --------------------------------------------------

  const handleFreeCourse = () => {
    setIsFree(true);
    setPrice(0);
    setDiscountPrice(0);
  };

  const handlePaidCourse = () => {
    setIsFree(false);

    if (price <= 0) {
      setPrice(499);
    }
  };

  // --------------------------------------------------
  // CLOSE
  // --------------------------------------------------

  const handleClose = () => {
    if (isSubmitting) return;

    onClose();
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const handleSubmit = (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      alert(
        'Please enter a course title.',
      );
      return;
    }

    if (!categoryId) {
      alert(
        'Please select a category.',
      );
      return;
    }

    if (!instructorId) {
      alert(
        'Please select an instructor.',
      );
      return;
    }

    if (!description.trim()) {
      alert(
        'Please enter a course description.',
      );
      return;
    }

    if (metaTitle.length > 255) {
      alert(
        'Meta title must be 255 characters or less.',
      );
      return;
    }

    if (metaDescription.length > 255) {
      alert(
        'Meta description must be 255 characters or less.',
      );
      return;
    }

    if (
      !isFree &&
      price <= 0
    ) {
      alert(
        'Please enter a valid course price.',
      );
      return;
    }

    if (
      !isFree &&
      discountPrice > 0 &&
      discountPrice >= price
    ) {
      alert(
        'Discount price must be lower than the original price.',
      );
      return;
    }

    onAddCourse({
      title: title.trim(),

      subtitle:
        subtitle.trim(),

      metaTitle:
        metaTitle.trim(),

      metaDescription:
        metaDescription.trim(),

      // Thumbnail is optional.
      // Parent will upload the File.
      thumbnail:
        thumbnailPreview || '',

      instructorName:
        selectedInstructor?.name ?? '',

      instructorAvatar: '',

      category: categoryId,

      level: level.trim(),

      studentsCount: 0,

      price: isFree
        ? 0
        : Number(price),

      isFree,

      status,

      approvalStatus,

      courseType,

      language:
        language.trim(),

      duration:
        duration.trim(),

      lessonsCount:
        Number(
          lessonsCount || 0,
        ),

      rating: 0,

      description:
        description.trim(),

      ...( {
        categoryId,
        instructorId,

        thumbnailFile,

        discount_price:
          isFree ||
          discountPrice <= 0
            ? null
            : Number(
                discountPrice,
              ),
      } as any),
    });

    onClose();
  };

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  useEffect(() => {
    if (!isOpen) return;

    setTitle('');
    setSubtitle('');
    setMetaTitle('');
    setMetaDescription('');
    setCategoryId('');
    setInstructorId('');
    setLevel('');
    setLanguage('');

    setIsFree(true);
    setPrice(0);
    setDiscountPrice(0);

    setStatus('Draft');
    setApprovalStatus('Pending');
    setCourseType('Standard');

    setThumbnailFile(null);
    setThumbnailPreview('');

    setDescription('');
    setDuration('');
    setLessonsCount(0);
  }, [isOpen]);

  console.log('🟧 AddCourseModal render:', {
    isOpen,
    level,
    levelsCount: levels.length,
    levels,
    isLoadingOptions,
    optionsError,
  });

  // --------------------------------------------------
  // HIDDEN
  // --------------------------------------------------

  if (!isOpen) {
    return null;
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] shadow-2xl w-full max-w-2xl overflow-hidden my-8">

        {/* HEADER */}

        <div className="px-6 py-4 border-b border-[#e2e8f0] dark:border-[#334155] flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">

          <div className="flex items-center gap-2.5">

            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-[#3b82f6] flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0f172a] dark:text-gray-100">
                Add New Course
              </h2>

              <p className="text-xs text-[#64748b] dark:text-gray-400">
                Fill in the details to publish or draft a new course.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
        >

          {/* OPTIONS ERROR */}

          {optionsError && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">

              <span>
                {optionsError}
              </span>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="flex items-center gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>

            </div>
          )}

          {/* TITLE */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Course Title *
              </label>

              <input
                type="text"
                required
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="e.g. Class 10th Science & Board Prep"
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Subtitle / Track
              </label>

              <input
                type="text"
                value={subtitle}
                onChange={(e) =>
                  setSubtitle(e.target.value)
                }
                placeholder="e.g. Science: Class 10"
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm"
              />
            </div>

          </div>

          {/* SEO */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Meta Title
              </label>

              <input
                type="text"
                value={metaTitle}
                maxLength={255}
                onChange={(e) =>
                  setMetaTitle(e.target.value)
                }
                placeholder="Enter SEO meta title"
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm"
              />

              <p className="mt-1 text-[11px] text-slate-400">
                {metaTitle.length}/255 characters
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Meta Description
              </label>

              <textarea
                rows={2}
                value={metaDescription}
                maxLength={255}
                onChange={(e) =>
                  setMetaDescription(e.target.value)
                }
                placeholder="Enter SEO meta description"
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm resize-none"
              />

              <p className="mt-1 text-[11px] text-slate-400">
                {metaDescription.length}/255 characters
              </p>
            </div>
          </div>

          {/* CATEGORY / INSTRUCTOR / LEVEL */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Category *
              </label>

              <select
                required
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(
                    e.target.value,
                  )
                }
                disabled={isLoadingOptions}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm"
              >
                <option value="">
                  {isLoadingOptions
                    ? 'Loading categories...'
                    : 'Select category'}
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {getCategoryName(
                        category,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Instructor *
              </label>

              <select
                required
                value={instructorId}
                onChange={(e) =>
                  setInstructorId(
                    e.target.value,
                  )
                }
                disabled={isLoadingOptions}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm"
              >
                <option value="">
                  {isLoadingOptions
                    ? 'Loading instructors...'
                    : 'Select instructor'}
                </option>

                {instructors.map(
                  (instructor) => (
                    <option
                      key={instructor.id}
                      value={instructor.id}
                    >
                      {instructor.name}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Level / Grade
              </label>

              <select
                value={level}
                onChange={(e) =>
                  setLevel(e.target.value)
                }
                disabled={isLoadingOptions}
                className="w-full px-3 py-2 border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100 rounded-lg text-sm"
              >
                <option value="">
                  {isLoadingOptions
                    ? 'Loading levels...'
                    : 'Select level'}
                </option>

                {levels.map((item) => (
                  <option
                    key={item.id}
                    value={item.slug ?? item.name ?? String(item.id)}
                  >
                    {getLevelName(item)}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* PRICING */}

          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-[#e2e8f0] dark:border-[#334155] space-y-4">

            <div className="flex items-center justify-between gap-4">

              <div>
                <p className="text-sm font-bold text-[#0f172a] dark:text-gray-100">
                  Course Pricing
                </p>

                <p className="text-xs text-[#64748b] dark:text-gray-400">
                  Set whether this course is free or paid.
                </p>
              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={handleFreeCourse}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    isFree
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-gray-300 border'
                  }`}
                >
                  Free Course
                </button>

                <button
                  type="button"
                  onClick={handlePaidCourse}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    !isFree
                      ? 'bg-[#3b82f6] text-white'
                      : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-gray-300 border'
                  }`}
                >
                  Paid Course
                </button>

              </div>

            </div>

            {!isFree && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                    Original Price *
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      price === 0
                        ? ''
                        : price
                    }
                    onChange={(e) =>
                      handlePriceChange(
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                    required={!isFree}
                    placeholder="2499"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                    Discount Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      discountPrice === 0
                        ? ''
                        : discountPrice
                    }
                    onChange={(e) =>
                      handleDiscountPriceChange(
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                    placeholder="1999"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />

                  {discountPercentage > 0 && (
                    <p className="mt-1.5 text-xs text-emerald-600 font-medium">
                      {discountPercentage}% OFF
                    </p>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* DELIVERY / LANGUAGE / STATUS */}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                Delivery Mode
              </label>

              <input
                type="text"
                value={courseType}
                onChange={(e) =>
                  setCourseType(
                    e.target.value as CourseType,
                  )
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                Language
              </label>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value)
                }
                disabled={isLoadingOptions}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-[#0F172A] text-[#0f172a] dark:text-gray-100"
              >
                <option value="">
                  {isLoadingOptions
                    ? 'Loading languages...'
                    : 'Select language'}
                </option>

                {languages.map((item) => (
                  <option
                    key={item.id}
                    value={item.name ?? item.slug ?? item.code ?? String(item.id)}
                  >
                    {getLanguageName(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                Publication Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as CourseStatus,
                  )
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="Published">
                  Published
                </option>

                <option value="Pending Review">
                  Pending Review
                </option>

                <option value="Draft">
                  Draft
                </option>

                <option value="Archived">
                  Archived
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                Approval Status
              </label>

              <select
                value={approvalStatus}
                onChange={(e) =>
                  setApprovalStatus(
                    e.target.value as ApprovalStatus,
                  )
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="Approved">
                  Approved
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Rejected">
                  Rejected
                </option>
              </select>
            </div>

          </div>

          {/* THUMBNAIL UPLOAD */}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Course Thumbnail
            </label>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4">

              <label className="flex flex-col items-center justify-center cursor-pointer">

                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Course thumbnail preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 text-slate-400 mb-2" />

                    <span className="text-sm font-semibold text-slate-600 dark:text-gray-300">
                      Click to upload thumbnail
                    </span>

                    <span className="text-xs text-slate-400 mt-1">
                      JPG, PNG or WEBP • Max 5MB
                    </span>
                  </>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={
                    handleThumbnailChange
                  }
                />

              </label>

              {thumbnailFile && (
                <div className="mt-3 flex items-center justify-between text-xs">

                  <span className="text-slate-500 truncate">
                    {thumbnailFile.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailFile(null);
                      setThumbnailPreview('');
                    }}
                    className="text-red-500 font-semibold hover:underline"
                  >
                    Remove
                  </button>

                </div>
              )}

            </div>
          </div>

          {/* DURATION + LESSONS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                Duration
              </label>

              <input
                type="text"
                value={duration}
                onChange={(e) =>
                  setDuration(
                    e.target.value,
                  )
                }
                placeholder="e.g. 40 hours"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                Lessons
              </label>

              <input
                type="number"
                min="0"
                value={lessonsCount}
                onChange={(e) =>
                  setLessonsCount(
                    Math.max(
                      0,
                      Number(
                        e.target.value,
                      ) || 0,
                    ),
                  )
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
              Course Description *
            </label>

            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value,
                )
              }
              placeholder="Outline what students will learn, prerequisites, and milestone assessments..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* FOOTER */}

          <div className="pt-4 border-t border-[#e2e8f0] dark:border-[#334155] flex items-center justify-end gap-3">

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 border rounded-lg text-sm font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingOptions
              }
              className="px-5 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Course</span>
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};