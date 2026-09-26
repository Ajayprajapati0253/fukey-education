import {
  get,
  post,
  patch,
  del,
} from '../../../services/api';

export type CouponStatus = 'active' | 'inactive';

export interface Coupon {
  id: string;
  author_id?: number | string;
  coupon_code: string;
  offer_percentage: string | number;
  min_price: string | number;
  expired_date: string;
  status: CouponStatus | string;
  created_at?: string;
  updated_at?: string;
}

export interface CouponPayload {
  coupon_code: string;
  offer_percentage: number;
  min_price: number;
  expired_date: string;
  status?: CouponStatus;
}

export interface CouponsResponse {
  status: string;
  data: Coupon[];
}

export interface CouponResponse {
  status: string;
  message?: string;
  data: Coupon;
}

/**
 * Get all coupons
 */
export const getCoupons = async (): Promise<CouponsResponse> => {
  return await get<CouponsResponse>('/admin/coupons');
};

/**
 * Create coupon
 */
export const createCoupon = async (
  data: CouponPayload,
): Promise<CouponResponse> => {
  return await post<CouponResponse, CouponPayload>(
    '/admin/coupons',
    data,
  );
};

/**
 * Update coupon
 */
export const updateCoupon = async (
  id: string | number,
  data: Partial<CouponPayload>,
): Promise<CouponResponse> => {
  return await patch<
    CouponResponse,
    Partial<CouponPayload>
  >(`/admin/coupons/${id}`, data);
};

/**
 * Delete coupon
 */
export const deleteCoupon = async (
  id: string | number,
) => {
  return await del(
    `/admin/coupons/${id}`,
  );
};