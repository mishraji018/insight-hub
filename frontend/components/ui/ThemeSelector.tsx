"use client";

import { useState, useEffect } from 'react';
import { Palette, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeFontPicker } from './ThemeFontPicker';

export function ThemeSelector() {
  const [activeTheme, setActiveTheme] = useState('cherry');
  const [activeFont, setActiveFont] = useState('Inter');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('app-theme') || 'cherry';
    const savedFont = localStorage.getItem('app-font-id') || 'Inter';
    setActiveTheme(savedTheme);
    setActiveFont(savedFont);
  }, []);

  const saveToDb = async (updates: Record<string, string>) => {
    try {
      await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('Failed to save preference to DB:', err);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <ThemeFontPicker
        currentTheme={activeTheme}
        currentFont={activeFont}
        onThemeChange={(id) => {
          setActiveTheme(id);
          saveToDb({ themePreference: id });
        }}
        onFontChange={(id) => {
          setActiveFont(id);
          saveToDb({ fontPreference: id });
        }}
      />
    </div>
  );
}

