import { NotificationSchedule, useNotificationSchedulesQuery } from '@/apis/notification-schedules';
import { DayOfWeek, DayOfWeekLabels, DayOfWeekType } from '@/constants/enums';
import { useNotificationScheduleForm } from '@/hooks/notification-schedule';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DAY_OF_WEEK_OPTIONS = Object.entries(DayOfWeek).map(([_, value]) => ({
  value: value as DayOfWeekType,
  label: DayOfWeekLabels[value as DayOfWeekType],
}));

export default function SchedulesScreen() {
  const insets = useSafeAreaInsets();
  const { data: schedules, isLoading, error } = useNotificationSchedulesQuery();

  const {
    modalVisible,
    setModalVisible,
    showDayPicker,
    setShowDayPicker,
    editingSchedule,
    selectedDay,
    setSelectedDay,
    time,
    setTime,
    isSaving,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
  } = useNotificationScheduleForm();

  const renderScheduleItem = ({ item }: { item: NotificationSchedule }) => (
    <View style={styles.scheduleItem}>
      <View style={styles.scheduleInfo}>
        <Text style={styles.scheduleDay}>
          {DayOfWeekLabels[item.dayOfWeek]}
        </Text>
        <Text style={styles.scheduleTime}>{item.notificationTime}</Text>
      </View>
      <View style={styles.scheduleActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>알림 스케줄</Text>
        <TouchableOpacity onPress={openCreateModal} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#6366f1" size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>스케줄을 불러오지 못했습니다.</Text>
        </View>
      ) : schedules && schedules.length > 0 ? (
        <FlatList
          data={schedules}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderScheduleItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyText}>등록된 스케줄이 없습니다.</Text>
          <TouchableOpacity style={styles.emptyAddButton} onPress={openCreateModal}>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingSchedule ? '스케줄 수정' : '스케줄 추가'}
            </Text>

            <Text style={styles.label}>요일</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDayPicker(true)}
            >
              <Text style={styles.pickerButtonText}>
                {DayOfWeekLabels[selectedDay]}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#a0a0c0" />
            </TouchableOpacity>

            <Text style={styles.label}>시간 (HH:mm)</Text>
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholder="09:00"
              placeholderTextColor="#666"
              keyboardType={
                Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'
              }
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
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
            <View style={styles.dayPickerContent}>
              {DAY_OF_WEEK_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dayOption,
                    selectedDay === option.value && styles.dayOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedDay(option.value);
                    setShowDayPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dayOptionText,
                      selectedDay === option.value && styles.dayOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selectedDay === option.value && (
                    <Ionicons name="checkmark" size={20} color="#6366f1" />
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
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  addButton: {
    padding: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#a0a0c0',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#a0a0c0',
    marginBottom: 20,
  },
  emptyAddButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleDay: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 15,
    color: '#a0a0c0',
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#6366f1',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#252542',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a0a0c0',
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 28,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a0a0c0',
  },
  saveButton: {
    backgroundColor: '#6366f1',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dayPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayPickerContent: {
    width: '85%',
    backgroundColor: '#252542',
    borderRadius: 16,
    padding: 8,
  },
  dayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 10,
  },
  dayOptionSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  dayOptionText: {
    fontSize: 16,
    color: '#fff',
  },
  dayOptionTextSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
});
