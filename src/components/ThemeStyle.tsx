import { useEffect } from 'react';
import { normalizeAppTheme } from '../utils/themes';

interface ThemeStyleProps {
  theme: string;
  activeThemePalette?: any;
}

export default function ThemeStyle({ theme }: ThemeStyleProps) {
  useEffect(() => {
    const normalized = normalizeAppTheme(theme);
    document.documentElement.setAttribute('data-theme', normalized);
  }, [theme]);

  return null;
}