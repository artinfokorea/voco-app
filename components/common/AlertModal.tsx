import { Colors } from '@/constants/colors';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Modal } from './Modal';

export type AlertType = 'info' | 'success' | 'error' | 'confirm';

export interface AlertButton {
  text: string;
  onPress?: () => void | Promise<void>;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertModalProps {
  visible: boolean;
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: AlertButton[];
  onClose: () => void;
}

/**
 * Alert/Confirm 공통 모달 컴포넌트
 * - 타입별 아이콘 지원 (info, success, error, confirm)
 * - 단일/복수 버튼 지원
 * - 비동기 버튼 액션 지원 (로딩 상태)
 */
export function AlertModal({
  visible,
  title,
  message,
  type = 'info',
  buttons = [{ text: '확인', style: 'default' }],
  onClose,
}: AlertModalProps) {
  const [loadingIndex, setLoadingIndex] = React.useState<number | null>(null);

  const handleButtonPress = async (button: AlertButton, index: number) => {
    if (loadingIndex !== null) return;

    try {
      if (button.onPress) {
        const result = button.onPress();
        if (result instanceof Promise) {
          setLoadingIndex(index);
          await result;
        }
      }
      onClose();
    } catch {
      // 에러 발생 시에도 모달 닫기
      onClose();
    } finally {
      setLoadingIndex(null);
    }
  };

  const getIconForType = () => {
    switch (type) {
      case 'success':
        return { icon: '✓', color: Colors.success };
      case 'error':
        return { icon: '!', color: Colors.accent };
      case 'confirm':
        return { icon: '?', color: Colors.primary };
      default:
        return { icon: 'i', color: Colors.primary };
    }
  };

  const iconConfig = getIconForType();

  return (
    <Modal visible={visible} onClose={onClose} dismissable={type !== 'confirm'}>
      <View style={styles.content}>
        {/* 아이콘 */}
        <View style={[styles.iconContainer, { backgroundColor: `${iconConfig.color}20` }]}>
          <Text style={[styles.iconText, { color: iconConfig.color }]}>
            {iconConfig.icon}
          </Text>
        </View>

        {/* 제목 */}
        <Text style={styles.title}>{title}</Text>

        {/* 메시지 */}
        {message && <Text style={styles.message}>{message}</Text>}
      </View>

      {/* 버튼 영역 */}
      <View style={[styles.buttonContainer, buttons.length > 1 && styles.buttonRow]}>
        {buttons.map((button, index) => {
          const isCancel = button.style === 'cancel';
          const isDestructive = button.style === 'destructive';
          const isLoading = loadingIndex === index;
          const isDisabled = loadingIndex !== null;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.button,
                buttons.length > 1 && styles.buttonFlex,
                isCancel && styles.cancelButton,
                isDestructive && styles.destructiveButton,
                !isCancel && !isDestructive && styles.primaryButton,
                isDisabled && styles.disabledButton,
              ]}
              onPress={() => handleButtonPress(button, index)}
              activeOpacity={0.8}
              disabled={isDisabled}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    isCancel && styles.cancelButtonText,
                    isDestructive && styles.destructiveButtonText,
                  ]}
                >
                  {button.text}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonFlex: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  destructiveButton: {
    backgroundColor: Colors.accent,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
  },
  destructiveButtonText: {
    color: Colors.white,
  },
});
