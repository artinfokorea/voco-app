import { Colors } from '@/constants/colors';
import React from 'react';
import {
  Modal as RNModal,
  ModalProps as RNModalProps,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

interface ModalProps extends Omit<RNModalProps, 'transparent' | 'animationType'> {
  children: React.ReactNode;
  onClose?: () => void;
  /** 배경 클릭으로 닫기 허용 여부 */
  dismissable?: boolean;
}

/**
 * 앱 공통 모달 컴포넌트
 * - 반투명 배경 (backdrop)
 * - 중앙 정렬된 컨텐츠 영역
 * - 배경 터치로 닫기 지원
 */
export function Modal({
  visible,
  children,
  onClose,
  dismissable = true,
  ...props
}: ModalProps) {
  const handleBackdropPress = () => {
    if (dismissable && onClose) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      {...props}
    >
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <Pressable style={styles.contentWrapper} onPress={(e) => e.stopPropagation()}>
          <View style={styles.container}>{children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 340,
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
});
