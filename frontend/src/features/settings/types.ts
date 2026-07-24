export type Language = 'uz' | 'ru' | 'en' | 'ja';

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  language: Language;
  avatarUrl?: string;
};

export type UpdateProfileInput = {
  fullName?: string;
  company?: string;
  language?: Language;
};

export const SUPPORTED_LANGUAGES: { code: Language; label: string }[] = [
  { code: 'uz', label: "O'zbek" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
];
