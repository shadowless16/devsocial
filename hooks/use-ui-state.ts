"use client";

import { useCallback } from 'react';
import { useApp } from '@/contexts/app-context';

export function useUIState() {
  const { state, toggleSidebar, setTheme } = useApp();

  const handleThemeToggle = useCallback(() => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Apply theme to DOM
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [state.theme, setTheme]);

  const handleSidebarToggle = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  return {
    theme: state.theme,
    sidebarOpen: state.sidebarOpen,
    handleThemeToggle,
    handleSidebarToggle,
    setTheme,
  };
}