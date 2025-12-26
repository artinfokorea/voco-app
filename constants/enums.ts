// Category Enum
export const Category = {
  DAILY: 'DAILY',
  BUSINESS: 'BUSINESS',
  TRAVEL: 'TRAVEL',
  SHOPPING: 'SHOPPING',
} as const;

export type Category = (typeof Category)[keyof typeof Category];

// Level Enum
export const Level = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
} as const;

export type Level = (typeof Level)[keyof typeof Level];

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

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];
