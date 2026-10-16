import { get, post, patch, del } from '../../../services/api';

export interface LiveClassApiItem {
  id: number;
  title: string;

  instructor_id: number;

  course_id?: number | null;
  free_course_id?: number | null;

  meeting_id?: string | null;
  meeting_url?: string | null;

  description?: string | null;

  start_time?: string | null;
  duration: number;

  is_recurring?: boolean;
  recurring_days?: string[] | null;
  end_date?: string | null;

  status: boolean;

  platform?: 'jitsi' | 'youtube' | null;

  youtube_video_id?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
}

export interface LiveClassListResponse {
  status: string;
  data: LiveClassApiItem[];
}

export interface LiveClassResponse {
  status: string;
  message?: string;
  data: LiveClassApiItem;
}

/* KPI */

export interface LiveClassesKPI {
  total: number;
  live: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}

export interface LiveClassesKPIResponse {
  status: string;
  data: LiveClassesKPI;
}

export interface CreateLiveClassPayload {
  title: string;
  instructor: number;
  course_id?: number;
  free_course_id?: number;
  platform?: 'jitsi' | 'youtube';
  description?: string;
  start_time?: string;
  recurring_days?: string[];
  recurring_time?: string;
  end_date?: string;
  duration: number;
  status: boolean;
  youtube_video_id?: string;
}

export interface UpdateLiveClassPayload {
  title: string;
  instructor: number;
  start_time: string;
  duration: number;
  description?: string;
  status: boolean;
}

export const getLiveClasses = async (): Promise<LiveClassApiItem[]> => {
  const response = await get<LiveClassListResponse>(
    '/admin/live-classes',
  );

  return response.data ?? [];
};

export const getLiveClass = async (
  id: string | number,
): Promise<LiveClassApiItem> => {
  const response = await get<LiveClassResponse>(
    `/admin/live-classes/${id}`,
  );

  return response.data;
};

export const createLiveClass = async (
  payload: CreateLiveClassPayload,
): Promise<LiveClassApiItem> => {
  const response = await post<LiveClassResponse>(
    '/admin/live-classes',
    payload,
  );

  return response.data;
};

export const updateLiveClass = async (
  id: string | number,
  payload: UpdateLiveClassPayload,
): Promise<LiveClassApiItem> => {
  const response = await patch<LiveClassResponse>(
    `/admin/live-classes/${id}`,
    payload,
  );

  return response.data;
};

export const deleteLiveClass = async (
  id: string | number,
): Promise<void> => {
  await del(`/admin/live-classes/${id}`);
};

export const getLiveClassesKPI =
  async (): Promise<LiveClassesKPI> => {
    const response =
      await get<LiveClassesKPIResponse>(
        '/admin/live-classes/kpi',
      );

    return response.data;
  };