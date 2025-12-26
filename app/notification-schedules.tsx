import {
  NotificationSchedule,
  useCreateNotificationScheduleMutation,
  useDeleteNotificationScheduleMutation,
  useNotificationSchedulesQuery,
  useUpdateNotificationScheduleMutation,
} from '@/apis/notification-schedules';
import { DayOfWeek } from '@/constants/enums';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  MONDAY: '월요일',
  TUESDAY: '화요일',
  WEDNESDAY: '수요일',
  THURSDAY: '목요일',
  FRIDAY: '금요일',
  SATURDAY: '토요일',
  SUNDAY: '일요일',
};

const DAY_OF_WEEK_OPTIONS = Object.entries(DayOfWeek).map(([_, value]) => ({
  value: value as DayOfWeek,
  label: DAY_OF_WEEK_LABELS[value as DayOfWeek],
}));

export default function NotificationSchedulesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<NotificationSchedule | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DayOfWeek.MONDAY);
  const [time, setTime] = useState('09:00');
  const [showDayPicker, setShowDayPicker] = useState(false);

  const { data: schedules, isLoading, error } = useNotificationSchedulesQuery();
  const createMutation = useCreateNotificationScheduleMutation();
  const updateMutation = useUpdateNotificationScheduleMutation();
  const deleteMutation = useDeleteNotificationScheduleMutation();

  const resetForm = () => {
    setSelectedDay(DayOfWeek.MONDAY);
    setTime('09:00');
    setEditingSchedule(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (schedule: NotificationSchedule) => {
    setEditingSchedule(schedule);
    setSelectedDay(schedule.dayOfWeek);
    setTime(schedule.notificationTime);
    setModalVisible(true);
  };

  const handleSave = () => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      Alert.alert('오류', '올바른 시간 형식을 입력해주세요 (HH:mm)');
      return;
    }

    if (editingSchedule) {
      updateMutation.mutate(
        { id: editingSchedule.id, data: { dayOfWeek: selectedDay, notificationTime: time } },
        {
          onSuccess: () => {
            setModalVisible(false);
            resetForm();
          },
          onError: (err: any) => {
            Alert.alert('수정 실패', err?.message || '다시 시도해주세요.');
          },
        }
      );
    } else {
      createMutation.mutate(
        { dayOfWeek: selectedDay, notificationTime: time },
        {
          onSuccess: () => {
            setModalVisible(false);
            resetForm();
          },
          onError: (err: any) => {
            Alert.alert('생성 실패', err?.message || '다시 시도해주세요.');
          },
        }
      );
    }
  };

  const handleDelete = (schedule: NotificationSchedule) => {
    Alert.alert('삭제 확인', '이 스케줄을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteMutation.mutate(schedule.id, {
            onError: (err: any) => {
              Alert.alert('삭제 실패', err?.message || '다시 시도해주세요.');
            },
          });
        },
      },
    ]);
  };

  const renderScheduleItem = ({ item }: { item: NotificationSchedule }) => (
    <View style={[styles.scheduleItem, { backgroundColor: theme.card }]}>
      <View style={styles.scheduleInfo}>
        <Text style={[styles.scheduleDay, { color: theme.text }]}>
          {DAY_OF_WEEK_LABELS[item.dayOfWeek]}
        </Text>
        <Text style={[styles.scheduleTime, { color: theme.textSecondary }]}>
          {item.notificationTime}
        </Text>
      </View>
      <View style={styles.scheduleActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.tint }]}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>알림 스케줄</Text>
        <TouchableOpacity onPress={openCreateModal} style={styles.addButton}>
          <Ionicons name="add" size={24} color={theme.tint} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.tint} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>
            스케줄을 불러오지 못했습니다.
          </Text>
        </View>
      ) : schedules && schedules.length > 0 ? (
        <FlatList
          data={schedules}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderScheduleItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            등록된 스케줄이 없습니다.
          </Text>
          <TouchableOpacity
            style={[styles.emptyAddButton, { backgroundColor: theme.tint }]}
            onPress={openCreateModal}
          >
            <Text style={styles.emptyAddButtonText}>스케줄 추가하기</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingSchedule ? '스케줄 수정' : '스케줄 추가'}
            </Text>

            <Text style={[styles.label, { color: theme.text }]}>요일</Text>
            <TouchableOpacity
              style={[styles.pickerButton, { borderColor: theme.border }]}
              onPress={() => setShowDayPicker(true)}
            >
              <Text style={[styles.pickerButtonText, { color: theme.text }]}>
                {DAY_OF_WEEK_LABELS[selectedDay]}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            <Text style={[styles.label, { color: theme.text }]}>시간 (HH:mm)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              value={time}
              onChangeText={setTime}
              placeholder="09:00"
              placeholderTextColor={theme.textSecondary}
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.tint }]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Modal
          visible={showDayPicker}
          animationType="fade"
          transparent
          onRequestClose={() => setShowDayPicker(false)}
        >
          <TouchableOpacity
            style={styles.dayPickerOverlay}
            activeOpacity={1}
            onPress={() => setShowDayPicker(false)}
          >
            <View style={[styles.dayPickerContent, { backgroundColor: theme.card }]}>
              {DAY_OF_WEEK_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dayOption,
                    selectedDay === option.value && { backgroundColor: theme.tint + '20' },
                  ]}
                  onPress={() => {
                    setSelectedDay(option.value);
                    setShowDayPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dayOptionText,
                      { color: selectedDay === option.value ? theme.tint : theme.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selectedDay === option.value && (
                    <Ionicons name="checkmark" size={20} color={theme.tint} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
  },
  emptyAddButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleDay: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  pickerButtonText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {},
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dayPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayPickerContent: {
    width: '80%',
    borderRadius: 12,
    padding: 8,
  },
  dayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
  },
  dayOptionText: {
    fontSize: 16,
  },
});
