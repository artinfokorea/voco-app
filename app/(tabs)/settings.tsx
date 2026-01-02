import { useLogoutMutation } from '@/apis/auth';
import {
  useDeleteMeMutation,
  useGetMeQuery,
  useUpdateMeMutation,
} from '@/apis/members';
import { Level, LevelType } from '@/constants/enums';
import { useModal } from '@/contexts/ModalContext';
import { tokenStorage } from '@/utils/token';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LevelLabels: Record<string, string> = {
  [Level.BEGINNER]: '초급',
  [Level.INTERMEDIATE]: '중급',
  [Level.ADVANCED]: '고급',
};

const LevelColors: Record<string, string> = {
  [Level.BEGINNER]: '#10b981',
  [Level.INTERMEDIATE]: '#6366f1',
  [Level.ADVANCED]: '#f59e0b',
};

const LEVELS: LevelType[] = [Level.BEGINNER, Level.INTERMEDIATE, Level.ADVANCED];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { alert, confirm } = useModal();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();
  const { mutate: updateMe, isPending: isUpdating } = useUpdateMeMutation();
  const { mutate: deleteMe, isPending: isDeleting } = useDeleteMeMutation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const { data: member, isLoading: isMemberLoading } = useGetMeQuery();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editEnglishName, setEditEnglishName] = useState('');
  const [editLevel, setEditLevel] = useState<LevelType>(Level.BEGINNER);

  useEffect(() => {
    let isMounted = true;
    tokenStorage.getAccessToken().then((token) => {
      if (!isMounted) return;
      setIsLoggedIn(Boolean(token));
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const openEditModal = () => {
    if (member) {
      setEditEnglishName(member.englishName);
      setEditLevel(member.level);
      setIsEditModalVisible(true);
    }
  };

  const handleUpdate = () => {
    if (!editEnglishName.trim()) {
      alert({ title: '알림', message: '영문 이름을 입력해주세요.' });
      return;
    }
    updateMe(
      { englishName: editEnglishName.trim(), level: editLevel },
      {
        onSuccess: () => {
          setIsEditModalVisible(false);
          alert({ title: '완료', message: '프로필이 수정되었습니다.', type: 'success' });
        },
        onError: (error: any) => {
          alert({ title: '수정 실패', message: error?.message || '다시 시도해주세요.', type: 'error' });
        },
      }
    );
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: '회원 탈퇴',
      message: '정말 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.',
      confirmText: '탈퇴',
      confirmStyle: 'destructive',
    });

    if (confirmed) {
      deleteMe(undefined, {
        onSuccess: () => {
          setIsLoggedIn(false);
          router.replace('/auth');
        },
        onError: (error: any) => {
          alert({ title: '탈퇴 실패', message: error?.message || '다시 시도해주세요.', type: 'error' });
        },
      });
    }
  };

  if (isLoggedIn === null) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ActivityIndicator color="#6366f1" />
      </View>
    );
  }

  const levelColor = member ? LevelColors[member.level] || '#6366f1' : '#6366f1';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>설정</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoggedIn && (
          <>
            {isMemberLoading ? (
              <View style={styles.profileCard}>
                <ActivityIndicator color="#6366f1" />
              </View>
            ) : member ? (
              <TouchableOpacity
                style={styles.profileCard}
                onPress={openEditModal}
                activeOpacity={0.8}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {member.koreanName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{member.koreanName}</Text>
                    <Text style={styles.profileEnglishName}>
                      {member.englishName}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.levelBadge,
                      { backgroundColor: levelColor + '20' },
                    ]}
                  >
                    <Text style={[styles.levelText, { color: levelColor }]}>
                      {LevelLabels[member.level] || member.level}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.profileDetail}>
                  <Text style={styles.detailLabel}>이메일</Text>
                  <Text style={styles.detailValue}>{member.email}</Text>
                </View>

                <View style={styles.editHint}>
                  <Text style={styles.editHintText}>탭하여 프로필 수정</Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 100 }]}>
        {isLoggedIn ? (
          <>
            <TouchableOpacity
              style={styles.logoutButton}
              disabled={isLoggingOut}
              onPress={() => {
                logout(undefined, {
                  onSuccess: () => {
                    setIsLoggedIn(false);
                    router.replace('/auth');
                  },
                  onError: (error: any) => {
                    alert({ title: '로그아웃 실패', message: error?.message || '다시 시도해주세요.', type: 'error' });
                  },
                });
              }}
              activeOpacity={0.85}
            >
              {isLoggingOut ? (
                <ActivityIndicator color="#ef4444" />
              ) : (
                <Text style={styles.logoutButtonText}>로그아웃</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              disabled={isDeleting}
              onPress={handleDelete}
              activeOpacity={0.85}
            >
              {isDeleting ? (
                <ActivityIndicator color="#6b7280" />
              ) : (
                <Text style={styles.deleteButtonText}>회원 탈퇴</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth')}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>로그인 / 회원가입</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <Text style={styles.modalCancelText}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>프로필 수정</Text>
            <TouchableOpacity onPress={handleUpdate} disabled={isUpdating}>
              {isUpdating ? (
                <ActivityIndicator color="#6366f1" size="small" />
              ) : (
                <Text style={styles.modalSaveText}>저장</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>영문 이름</Text>
              <TextInput
                style={styles.textInput}
                value={editEnglishName}
                onChangeText={setEditEnglishName}
                placeholder="English Name"
                placeholderTextColor="#6b7280"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>레벨</Text>
              <View style={styles.levelSelector}>
                {LEVELS.map((level) => {
                  const color = LevelColors[level];
                  const isSelected = editLevel === level;
                  return (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.levelOption,
                        isSelected && { backgroundColor: color + '30', borderColor: color },
                      ]}
                      onPress={() => setEditLevel(level)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.levelOptionText,
                          isSelected && { color },
                        ]}
                      >
                        {LevelLabels[level]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  profileEnglishName: {
    fontSize: 14,
    color: '#a0a0c0',
    marginTop: 2,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
  profileDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
  },
  editHint: {
    marginTop: 16,
    alignItems: 'center',
  },
  editHintText: {
    fontSize: 12,
    color: '#6b7280',
  },
  footer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  logoutButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#a0a0c0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#a0a0c0',
    marginBottom: 8,
  },
  textInput: {
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  levelSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  levelOption: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  levelOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#a0a0c0',
  },
});
