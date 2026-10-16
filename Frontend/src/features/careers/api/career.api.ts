import {
  get,
  post,
  patch,
  del,
} from '../../../services/api';

/* =====================================================
   Types
===================================================== */

export type CareerEmploymentType =
  | 'Full Time'
  | 'Part Time'
  | 'Internship'
  | 'Contract';

export type CareerStatus =
  | 'draft'
  | 'published'
  | 'closed';

export interface Career {
  id: string;

  title: string;

  department?: string | null;

  location?: string | null;

  employment_type?:
    | CareerEmploymentType
    | string
    | null;

  experience?: string | null;

  salary?: string | null;

  vacancies?: number | null;

  description?: string | null;

  requirements?: string | null;

  responsibilities?: string | null;

  benefits?: string | null;

  status: CareerStatus | string;

  is_featured?: boolean | null;

  is_urgent?: boolean | null;

  is_remote?: boolean | null;

  published_at?: string | null;

  created_at?: string | null;

  updated_at?: string | null;

  [key: string]: any;
}

export interface CareerPayload {
  title: string;

  department?: string;

  location?: string;

  employment_type?: CareerEmploymentType;

  experience?: string;

  salary?: string;

  vacancies?: number;

  description?: string;

  requirements?: string;

  responsibilities?: string;

  benefits?: string;

  status: CareerStatus;

  is_featured?: boolean;

  is_urgent?: boolean;

  is_remote?: boolean;

  published_at?: string;
}

export interface CareersResponse {
  status: string;

  data: Career[];

  departments?: (
    | string
    | null
  )[];

  locations?: (
    | string
    | null
  )[];

  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface CareerResponse {
  status: string;

  data: Career;
}

export interface CareerDeleteResponse {
  status: string;

  message: string;
}

export interface CareerStatusResponse {
  status: string;

  message?: string;

  data?: Career;
}

/* =====================================================
   GET ALL CAREERS
===================================================== */

export const getCareers = async (
  params?: {
    page?: number;
    limit?: number;

    keyword?: string;

    department?: string;

    location?: string;

    employment_type?: string;

    status?: string;

    order_by?: number;
  },
): Promise<CareersResponse> => {
  return await get<CareersResponse>(
    '/admin/careers',
    {
      params,
    },
  );
};

/* =====================================================
   GET SINGLE CAREER
===================================================== */

export const getCareer = async (
  id: string | number,
): Promise<CareerResponse> => {
  return await get<CareerResponse>(
    `/admin/careers/${id}`,
  );
};

/* =====================================================
   CREATE CAREER
===================================================== */

export const createCareer = async (
  payload: CareerPayload,
): Promise<CareerResponse> => {
  return await post<
    CareerResponse,
    CareerPayload
  >(
    '/admin/careers',
    payload,
  );
};

/* =====================================================
   UPDATE CAREER
===================================================== */

export const updateCareer = async (
  id: string | number,
  payload: Partial<CareerPayload>,
): Promise<CareerResponse> => {
  return await patch<
    CareerResponse,
    Partial<CareerPayload>
  >(
    `/admin/careers/${id}`,
    payload,
  );
};

/* =====================================================
   DELETE CAREER
===================================================== */

export const deleteCareer = async (
  id: string | number,
): Promise<CareerDeleteResponse> => {
  return await del<CareerDeleteResponse>(
    `/admin/careers/${id}`,
  );
};

/* =====================================================
   UPDATE CAREER STATUS
===================================================== */

export const updateCareerStatus =
  async (
    id: string | number,
    status: CareerStatus,
  ): Promise<CareerStatusResponse> => {
    return await patch<CareerStatusResponse>(
      `/admin/careers/${id}/status`,
      {
        status,
      },
    );
  };