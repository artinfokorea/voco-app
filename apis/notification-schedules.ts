import { ServerResponse, createServerError } from '@/apis/auth';
import { DayOfWeek } from '@/constants/enums';
import { apiClient } from '@/utils/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --- Types ---
export interface CreateNotificationScheduleRequest {
  dayOfWeek: DayOfWeek;
  notificationTime: string; // Format: "HH:mm" (e.g., "09:00")
}

export interface UpdateNotificationScheduleRequest {
  dayOfWeek: DayOfWeek;
  notificationTime: string;
}

export interface NotificationSchedule {
  id: number;
  dayOfWeek: DayOfWeek;
  notificationTime: string;
}

// --- API Functions ---
const notificationSchedulesApi = {
  getAll: async (): Promise<ServerResponse<NotificationSchedule[]>> => {
    const response = await apiClient.get<ServerResponse<NotificationSchedule[]>>(
      'notification-schedules'
    );

    const serverData = response.data;
    if (serverData.type === 'FAIL') {
      throw createServerError(serverData);
    }
    return serverData;
  },

  create: async (
    data: CreateNotificationScheduleRequest
  ): Promise<ServerResponse<NotificationSchedule>> => {
    const response = await apiClient.post<ServerResponse<NotificationSchedule>>(
      'notification-schedules',
      data
    );

    const serverData = response.data;
    if (serverData.type === 'FAIL') {
      throw createServerError(serverData);
    }
    return serverData;
  },

  update: async (
    id: number,
    data: UpdateNotificationScheduleRequest
  ): Promise<ServerResponse<NotificationSchedule>> => {
    const response = await apiClient.put<ServerResponse<NotificationSchedule>>(
      `notification-schedules/${id}`,
      data
    );

    const serverData = response.data;
    if (serverData.type === 'FAIL') {
      throw createServerError(serverData);
    }
    return serverData;
  },

  delete: async (id: number): Promise<ServerResponse<null>> => {
    const response = await apiClient.delete<ServerResponse<null>>(
      `notification-schedules/${id}`
    );

    const serverData = response.data;
    if (serverData.type === 'FAIL') {
      throw createServerError(serverData);
    }
    return serverData;
  },
};

// --- Query Keys ---
export const notificationScheduleKeys = {
  all: ['notification-schedules'] as const,
};

// --- React Query Hooks ---
export const useNotificationSchedulesQuery = () => {
  return useQuery({
    queryKey: notificationScheduleKeys.all,
    queryFn: notificationSchedulesApi.getAll,
    select: (data) => data.item,
  });
};

export const useCreateNotificationScheduleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationSchedulesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationScheduleKeys.all });
    },
  });
};

export const useUpdateNotificationScheduleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNotificationScheduleRequest }) =>
      notificationSchedulesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationScheduleKeys.all });
    },
  });
};

export const useDeleteNotificationScheduleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationSchedulesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationScheduleKeys.all });
    },
  });
};

export default notificationSchedulesApi;
