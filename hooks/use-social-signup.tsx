import type { SocialProvider } from '@/apis/members';
import { CategoryType, LevelType } from '@/constants/enums';
import React, { createContext, useContext, useMemo, useState } from 'react';

type SignupDraft = {
  provider: SocialProvider;
  idToken: string;
  koreanName: string;
  englishName: string;
  level: LevelType | null;
  categories: CategoryType[];
};

type SocialSignUpContextValue = {
  draft: SignupDraft | null;
  start: (seed: { provider: SocialProvider; idToken: string }) => void;
  setNames: (names: { koreanName: string; englishName: string }) => void;
  setLevel: (level: LevelType) => void;
  toggleCategory: (category: CategoryType) => void;
  reset: () => void;
};

const SocialSignUpContext = createContext<SocialSignUpContextValue | null>(
  null
);

export function SocialSignUpProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState<SignupDraft | null>(null);

  const value = useMemo<SocialSignUpContextValue>(() => {
    const start: SocialSignUpContextValue['start'] = ({
      provider,
      idToken,
    }) => {
      setDraft({
        provider,
        idToken,
        koreanName: '',
        englishName: '',
        level: null,
        categories: [],
      });
    };

    const setNames: SocialSignUpContextValue['setNames'] = ({
      koreanName,
      englishName,
    }) => {
      setDraft((current) =>
        current
          ? {
              ...current,
              koreanName: koreanName.trim(),
              englishName: englishName.trim(),
            }
          : current
      );
    };

    const setLevel: SocialSignUpContextValue['setLevel'] = (level) => {
      setDraft((current) => (current ? { ...current, level } : current));
    };

    const toggleCategory: SocialSignUpContextValue['toggleCategory'] = (
      category
    ) => {
      setDraft((current) => {
        if (!current) return current;
        const exists = current.categories.includes(category);
        const categories = exists
          ? current.categories.filter((c) => c !== category)
          : [...current.categories, category];
        return { ...current, categories };
      });
    };

    const reset: SocialSignUpContextValue['reset'] = () => setDraft(null);

    return { draft, start, setNames, setLevel, toggleCategory, reset };
  }, [draft]);

  return (
    <SocialSignUpContext.Provider value={value}>
      {children}
    </SocialSignUpContext.Provider>
  );
}

export function useSocialSignUp() {
  const ctx = useContext(SocialSignUpContext);
  if (!ctx) {
    throw new Error('useSocialSignUp must be used within SocialSignUpProvider');
  }
  return ctx;
}
