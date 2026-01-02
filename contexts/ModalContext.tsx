import {
  AlertButton,
  AlertModal,
  AlertType,
} from '@/components/common/AlertModal';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface AlertOptions {
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: AlertButton[];
}

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'default' | 'destructive';
}

interface ModalContextValue {
  /**
   * 알림 모달 표시
   * @example
   * alert({ title: '오류', message: '다시 시도해주세요.', type: 'error' });
   */
  alert: (options: AlertOptions) => void;

  /**
   * 확인 모달 표시 (Promise 반환)
   * @returns true: 확인, false: 취소
   * @example
   * const confirmed = await confirm({ title: '삭제 확인', message: '정말 삭제하시겠습니까?' });
   * if (confirmed) { ... }
   */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextValue | null>(null);

interface ModalState {
  visible: boolean;
  title: string;
  message?: string;
  type: AlertType;
  buttons: AlertButton[];
}

const initialState: ModalState = {
  visible: false,
  title: '',
  message: undefined,
  type: 'info',
  buttons: [],
};

/**
 * 모달 Provider
 * - App 루트에 추가하여 전역에서 모달 사용 가능
 */
export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>(initialState);
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, visible: false }));
    // 상태 초기화 (애니메이션 후)
    setTimeout(() => {
      setModalState(initialState);
    }, 300);
  }, []);

  const alert = useCallback(
    ({ title, message, type = 'info', buttons }: AlertOptions) => {
      const defaultButtons: AlertButton[] = buttons || [
        { text: '확인', style: 'default' },
      ];

      setModalState({
        visible: true,
        title,
        message,
        type,
        buttons: defaultButtons,
      });
    },
    []
  );

  const confirm = useCallback(
    ({
      title,
      message,
      confirmText = '확인',
      cancelText = '취소',
      confirmStyle = 'default',
    }: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;

        const buttons: AlertButton[] = [
          {
            text: cancelText,
            style: 'cancel',
            onPress: () => {
              resolveRef.current?.(false);
              resolveRef.current = null;
            },
          },
          {
            text: confirmText,
            style: confirmStyle,
            onPress: () => {
              resolveRef.current?.(true);
              resolveRef.current = null;
            },
          },
        ];

        setModalState({
          visible: true,
          title,
          message,
          type: 'confirm',
          buttons,
        });
      });
    },
    []
  );

  const handleClose = useCallback(() => {
    // confirm에서 배경 클릭으로 닫힐 때 false 반환
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
    closeModal();
  }, [closeModal]);

  return (
    <ModalContext.Provider value={{ alert, confirm }}>
      {children}
      <AlertModal
        visible={modalState.visible}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        buttons={modalState.buttons}
        onClose={handleClose}
      />
    </ModalContext.Provider>
  );
}

/**
 * 모달 훅
 * @example
 * const { alert, confirm } = useModal();
 *
 * // 알림 표시
 * alert({ title: '완료', message: '저장되었습니다.', type: 'success' });
 *
 * // 확인 대화상자
 * const confirmed = await confirm({ title: '삭제', message: '정말 삭제하시겠습니까?', confirmStyle: 'destructive' });
 */
export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
