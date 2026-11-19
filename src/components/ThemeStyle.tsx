import React from 'react';

interface ThemeStyleProps {
  theme: string;
  activeThemePalette: any;
}

export default function ThemeStyle({ theme, activeThemePalette }: ThemeStyleProps) {
  return (
    <style>{`
      [data-theme="${theme}"] {
        --mfb-bg: ${activeThemePalette.background};
        --mfb-surface: ${activeThemePalette.surface};
        --mfb-surface-alt: ${activeThemePalette.surfaceAlt};
        --mfb-hover: ${activeThemePalette.hover};
        --mfb-hover-text: ${activeThemePalette.hoverText};
        --mfb-selected-bg: ${activeThemePalette.selectedBg};
        --mfb-selected-text: ${activeThemePalette.selectedText};
        --mfb-text: ${activeThemePalette.text};
        --mfb-muted: ${activeThemePalette.muted};
        --mfb-primary: ${activeThemePalette.primary};
        --mfb-primary-text: ${activeThemePalette.primaryText};
        --mfb-border: ${activeThemePalette.border};
        background-color: var(--mfb-bg) !important;
        color: var(--mfb-text) !important;
      }

      [data-theme="${theme}"] ::selection {
        background-color: var(--mfb-primary) !important;
        color: var(--mfb-primary-text) !important;
      }

      [data-theme="${theme}"] [class*="bg-white"] {
        background-color: var(--mfb-surface) !important;
        color: var(--mfb-text) !important;
      }
      [data-theme="${theme}"] [class*="bg-zinc-50"],
      [data-theme="${theme}"] [class*="bg-zinc-100"] {
        background-color: var(--mfb-surface-alt) !important;
        color: var(--mfb-text) !important;
      }

      [data-theme="${theme}"] tbody tr:hover,
      [data-theme="${theme}"] tbody tr:hover > td,
      [data-theme="${theme}"] [class*="hover:bg-white"]:hover,
      [data-theme="${theme}"] [class*="hover:bg-zinc-50"]:hover,
      [data-theme="${theme}"] [class*="hover:bg-zinc-100"]:hover,
      [data-theme="${theme}"] [class*="hover:bg-zinc-200"]:hover {
        background-color: var(--mfb-hover) !important;
        color: var(--mfb-hover-text) !important;
      }

      [data-theme="${theme}"] button[class*="hover:bg-zinc-"]:hover *,
      [data-theme="${theme}"] button[class*="hover:bg-white"]:hover *,
      [data-theme="${theme}"] [class*="hover:text-zinc-"]:hover {
        color: var(--mfb-hover-text) !important;
      }

      [data-theme="${theme}"] .bg-sky-50,
      [data-theme="${theme}"] .mfb-selected {
        background-color: var(--mfb-selected-bg) !important;
        color: var(--mfb-selected-text) !important;
        border-color: var(--mfb-primary) !important;
      }
      [data-theme="${theme}"] .bg-sky-50 *,
      [data-theme="${theme}"] .mfb-selected * {
        color: var(--mfb-selected-text) !important;
      }

      [data-theme="${theme}"] .bg-zinc-900,
      [data-theme="${theme}"] [class*="hover:bg-zinc-800"]:hover {
        background-color: var(--mfb-primary) !important;
        color: var(--mfb-primary-text) !important;
        border-color: var(--mfb-primary) !important;
      }
      [data-theme="${theme}"] .bg-zinc-900 * {
        color: var(--mfb-primary-text) !important;
      }
      [data-theme="${theme}"] .bg-zinc-900 .bg-zinc-800,
      [data-theme="${theme}"] .bg-zinc-900 .bg-zinc-700 {
        background-color: rgba(0, 0, 0, 0.25) !important;
        color: var(--mfb-primary-text) !important;
      }

      [data-theme="${theme}"] input:not([type="color"]),
      [data-theme="${theme}"] select,
      [data-theme="${theme}"] textarea,
      [data-theme="${theme}"] input:not([type="color"]):focus,
      [data-theme="${theme}"] select:focus,
      [data-theme="${theme}"] textarea:focus,
      [data-theme="${theme}"] [class*="focus:bg-white"]:focus {
        background-color: var(--mfb-surface) !important;
        color: var(--mfb-text) !important;
        border-color: var(--mfb-border) !important;
      }
      [data-theme="${theme}"] input:not([type="color"]):focus,
      [data-theme="${theme}"] select:focus,
      [data-theme="${theme}"] textarea:focus {
        border-color: var(--mfb-primary) !important;
      }
      [data-theme="${theme}"] select option {
        background-color: var(--mfb-surface) !important;
        color: var(--mfb-text) !important;
      }

      [data-theme="${theme}"] .text-zinc-900,
      [data-theme="${theme}"] .text-zinc-800,
      [data-theme="${theme}"] .text-zinc-700 {
        color: var(--mfb-text) !important;
      }
      [data-theme="${theme}"] .text-zinc-600,
      [data-theme="${theme}"] .text-zinc-500,
      [data-theme="${theme}"] .text-zinc-400 {
        color: var(--mfb-muted) !important;
      }
      [data-theme="${theme}"] .border-zinc-100,
      [data-theme="${theme}"] .border-zinc-200,
      [data-theme="${theme}"] .border-zinc-300,
      [data-theme="${theme}"] .divide-zinc-200 > :not([hidden]) ~ :not([hidden]) {
        border-color: var(--mfb-border) !important;
      }

      @media print {
        aside, header, .no-print { display: none !important; }
        body, .mfb-theme-root { background: #ffffff !important; color: #000000 !important; }
      }
    `}</style>
  );
}