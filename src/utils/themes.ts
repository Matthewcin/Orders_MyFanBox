export type AppTheme = 'light' | 'dark' | 'myfanbox';

export const APP_THEME_STORAGE_KEY = 'mfb_app_theme';

export interface AppThemeOption {
  id: AppTheme;
  name: string;
  short: string;
  desc: string;
  dot: string;
  border: string;
}

export const APP_THEMES: AppThemeOption[] = [
  {
    id: 'light',
    name: 'Claro',
    short: 'Claro',
    desc: 'Fondo limpio blanco y acento lila',
    dot: 'linear-gradient(135deg, #FFFFFF 52%, #C7BAFF 52%)',
    border: 'rgba(34, 34, 34, 0.25)'
  },
  {
    id: 'dark',
    name: 'Oscuro',
    short: 'Oscuro',
    desc: 'Grafito neutro con alto contraste',
    dot: 'linear-gradient(135deg, #222222 52%, #C7BAFF 52%)',
    border: 'rgba(199, 186, 255, 0.65)'
  },
  {
    id: 'myfanbox',
    name: 'MyFanBox',
    short: 'MyFanBox',
    desc: 'Oscuro amatista oficial de la marca',
    dot: 'linear-gradient(135deg, #231F33 50%, #C7BAFF 50%)',
    border: '#C7BAFF'
  }
];

export const APP_THEME_PALETTES: Record<AppTheme, any> = {
  light: {
    background: '#ECEAF4',
    surface: '#FFFFFF',
    surfaceAlt: '#F6F5FA',
    hover: '#EFEBF8',
    hoverText: '#222222',
    selectedBg: '#EBE6FF',
    selectedText: '#222222',
    text: '#222222',
    muted: '#7A7788',
    primary: '#222222',
    primaryText: '#FFFFFF',
    border: '#DFDCEB',
    isDark: false
  },
  dark: {
    background: '#161616',
    surface: '#222222',
    surfaceAlt: '#2B2B30',
    hover: '#323238',
    hoverText: '#FFFFFF',
    selectedBg: '#312D44',
    selectedText: '#F4F4F6',
    text: '#F4F4F6',
    muted: '#9A9AA4',
    primary: '#C7BAFF',
    primaryText: '#161616',
    border: '#34343B',
    isDark: true
  },
  myfanbox: {
    background: '#13111C',
    surface: '#1F1B2E',
    surfaceAlt: '#29243C',
    hover: '#332C4A',
    hoverText: '#FFFFFF',
    selectedBg: '#393159',
    selectedText: '#F7F5FF',
    text: '#F7F5FF',
    muted: '#A69EC2',
    primary: '#C7BAFF',
    primaryText: '#161322',
    border: '#393254',
    isDark: true
  }
};

export function normalizeAppTheme(value: unknown): AppTheme {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'light' || raw === 'claro') return 'light';
  if (raw === 'dark' || raw === 'oscuro') return 'dark';
  if (raw === 'myfanbox') return 'myfanbox';
  return 'myfanbox';
}

export function readStoredAppTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(APP_THEME_STORAGE_KEY);
    if (saved) return normalizeAppTheme(saved);
  } catch {}
  return 'myfanbox';
}

export function saveStoredAppTheme(theme: AppTheme): void {
  try {
    localStorage.setItem(APP_THEME_STORAGE_KEY, theme);
  } catch {}
}