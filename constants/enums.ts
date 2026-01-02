// Category Enum
export const Category = {
  DAILY: 'DAILY',
  BUSINESS: 'BUSINESS',
  TRAVEL: 'TRAVEL',
  SHOPPING: 'SHOPPING',
} as const;

export type CategoryType = (typeof Category)[keyof typeof Category];

// Level Enum
export const Level = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
} as const;

export type LevelType = (typeof Level)[keyof typeof Level];

// DayOfWeek Enum
export const DayOfWeek = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY',
} as const;

export type DayOfWeekType = (typeof DayOfWeek)[keyof typeof DayOfWeek];

export const DayOfWeekLabels: Record<DayOfWeekType, string> = {
  MONDAY: '월요일',
  TUESDAY: '화요일',
  WEDNESDAY: '수요일',
  THURSDAY: '목요일',
  FRIDAY: '금요일',
  SATURDAY: '토요일',
  SUNDAY: '일요일',
};

export const Grade = {
  EXCELLENT: 'EXCELLENT',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  POOR: 'POOR',
  BAD: 'BAD',
} as const;

export type GradeType = (typeof Grade)[keyof typeof Grade];

export const GradeColors: Record<GradeType, string> = {
  EXCELLENT: '#55efc4',
  GOOD: '#81ecec',
  FAIR: '#ffeaa7',
  POOR: '#fab1a0',
  BAD: '#ff7675',
};
