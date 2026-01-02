import {
  NotificationSchedule,
  useCreateNotificationScheduleMutation,
  useDeleteNotificationScheduleMutation,
  useUpdateNotificationScheduleMutation,
} from '@/apis/notification-schedules';
import { DayOfWeek, DayOfWeekType } from '@/constants/enums';
import { useModal } from '@/contexts/ModalContext';
import { useCallback, useState } from 'react';

/**
 * 알림 스케줄 폼 상태 및 CRUD 작업을 관리하는 훅
 *
 * @description
 * - 모달 표시/숨김 상태 관리
 * - 요일 선택, 시간 입력 폼 상태 관리
 * - 생성/수정/삭제 뮤테이션 처리
 * - 시간 형식 유효성 검사 (HH:mm)
 */
export function useNotificationScheduleForm() {
  const { alert, confirm } = useModal();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<NotificationSchedule | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeekType>(DayOfWeek.MONDAY);
  const [time, setTime] = useState('09:00');
  const [showDayPicker, setShowDayPicker] = useState(false);

  const createMutation = useCreateNotificationScheduleMutation();
  const updateMutation = useUpdateNotificationScheduleMutation();
  const deleteMutation = useDeleteNotificationScheduleMutation();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  /**
   * 폼 상태를 초기값으로 리셋
   */
  const resetForm = useCallback(() => {
    setSelectedDay(DayOfWeek.MONDAY);
    setTime('09:00');
    setEditingSchedule(null);
  }, []);

  /**
   * 새 스케줄 생성을 위한 모달 열기
   */
  const openCreateModal = useCallback(() => {
    resetForm();
    setModalVisible(true);
  }, [resetForm]);

  /**
   * 기존 스케줄 수정을 위한 모달 열기
   */
  const openEditModal = useCallback((schedule: NotificationSchedule) => {
    setEditingSchedule(schedule);
    setSelectedDay(schedule.dayOfWeek);
    setTime(schedule.notificationTime);
    setModalVisible(true);
  }, []);

  /**
   * 모달 닫기 및 폼 리셋
   */
  const closeModal = useCallback(() => {
    setModalVisible(false);
    resetForm();
  }, [resetForm]);

  /**
   * 시간 형식 유효성 검사 (HH:mm)
   */
  const validateTime = useCallback((timeStr: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeStr);
  }, []);

  /**
   * 스케줄 저장 (생성 또는 수정)
   */
  const handleSave = useCallback(() => {
    if (!validateTime(time)) {
      alert({ title: '오류', message: '올바른 시간 형식을 입력해주세요 (HH:mm)', type: 'error' });
      return;
    }

    const onSuccess = () => {
      setModalVisible(false);
      resetForm();
    };

    const onError = (err: any) => {
      alert({
        title: editingSchedule ? '수정 실패' : '생성 실패',
        message: err?.message || '다시 시도해주세요.',
        type: 'error',
      });
    };

    if (editingSchedule) {
      updateMutation.mutate(
        {
          id: editingSchedule.id,
          data: { dayOfWeek: selectedDay, notificationTime: time },
        },
        { onSuccess, onError }
      );
    } else {
      createMutation.mutate(
        { dayOfWeek: selectedDay, notificationTime: time },
        { onSuccess, onError }
      );
    }
  }, [
    time,
    validateTime,
    editingSchedule,
    selectedDay,
    resetForm,
    createMutation,
    updateMutation,
    alert,
  ]);

  /**
   * 스케줄 삭제 확인 및 실행
   */
  const handleDelete = useCallback(
    async (schedule: NotificationSchedule) => {
      const confirmed = await confirm({
        title: '삭제 확인',
        message: '이 스케줄을 삭제하시겠습니까?',
        confirmText: '삭제',
        confirmStyle: 'destructive',
      });

      if (confirmed) {
        deleteMutation.mutate(schedule.id, {
          onError: (err: any) => {
            alert({
              title: '삭제 실패',
              message: err?.message || '다시 시도해주세요.',
              type: 'error',
            });
          },
        });
      }
    },
    [deleteMutation, confirm, alert]
  );

  return {
    // 모달 상태
    modalVisible,
    setModalVisible,
    showDayPicker,
    setShowDayPicker,

    // 폼 상태
    editingSchedule,
    selectedDay,
    setSelectedDay,
    time,
    setTime,

    // 로딩 상태
    isSaving,

    // 액션
    openCreateModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
  };
}
