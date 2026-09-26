import { get, patch, del } from '../../../services/api';

export interface Career {
  id: string;
  title: string;
  department?: string | null;
  location?: string | null;
  employment_type?: string | null;
  status?: string | null;
  [key: string]: any;
}

export interface CareersResponse {
  status: string;
  data: Career[];
  departments?: (string | null)[];
  locations?: (string | null)[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface CareerApplication {
  id: string;
  career_id: string;
  name: string;
  email: string;
  status: string;
  resume?: string | null;
  phone?: string | null;
  mobile?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: any;
}

export interface CareerApplicationsResponse {
  status: string;
  data: CareerApplication[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface CareerApplicationResumeResponse {
  status: string;
  data: {
    id: string;
    name: string;
    resume_url: string;
  };
}

/**
 * Get careers for career selector
 */
export const getCareers = async (
  params?: {
    page?: number;
    limit?: number;
    keyword?: string;
    status?: string;
  },
): Promise<CareersResponse> => {
  return await get<CareersResponse>(
    '/admin/careers',
    {
      params: {
        ...params,
        limit: params?.limit ?? 100,
      },
    },
  );
};

/**
 * Get applications for a career
 */
export const getCareerApplications = async (
  careerId: string | number,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    keyword?: string;
  },
): Promise<CareerApplicationsResponse> => {
  return await get<CareerApplicationsResponse>(
    `/admin/career-applications/career/${careerId}`,
    {
      params,
    },
  );
};

/**
 * Update application status
 */
export const updateCareerApplicationStatus = async (
  id: string | number,
  status: string,
) => {
  return await patch(
    `/admin/career-applications/${id}/status`,
    {
      status,
    },
  );
};

/**
 * Delete application
 */
export const deleteCareerApplication = async (
  id: string | number,
) => {
  return await del(
    `/admin/career-applications/${id}`,
  );
};

/**
 * Get signed resume URL
 */
export const getCareerApplicationResume = async (
  id: string | number,
): Promise<CareerApplicationResumeResponse> => {
  return await get<CareerApplicationResumeResponse>(
    `/admin/career-applications/${id}/resume`,
  );
};