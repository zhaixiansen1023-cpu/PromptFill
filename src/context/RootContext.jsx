import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStickyState } from '../hooks';
import { getSystemLanguage } from '../utils';
import { TRANSLATIONS } from '../constants/translations';

const RootContext = createContext();

const APP_VERSION = "1.1.2";

export const RootProvider = ({ children }) => {
  const [language, setLanguage] = useStickyState(getSystemLanguage(), "app_language_v1");
  const [themeMode, setThemeMode] = useStickyState("dark", "app_theme_mode_v1");
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 面板显隐状态，持久化
  const [isTagSidebarVisible, setIsTagSidebarVisible] = useStickyState(true, "panel_tag_sidebar_v1");
  const [isTemplatesSidebarVisible, setIsTemplatesSidebarVisible] = useStickyState(true, "panel_templates_sidebar_v1");
  const [isBanksSidebarVisible, setIsBanksSidebarVisible] = useStickyState(true, "panel_banks_sidebar_v1");

  // 监听来自父级的设置同步 (postMessage)
  useEffect(() => {
    const handleMessage = (event) => {
      const { type, lang, theme } = event.data || {};
      if (type === 'SET_LANG' && lang) {
        setLanguage(lang);
      } else if (type === 'SET_THEME' && theme) {
        // 强制映射到亮色/深色，移除系统模式
        setThemeMode(theme === 'dark' ? 'dark' : 'light');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setLanguage, setThemeMode]);

  const t = (key, params = {}) => {
    let str = TRANSLATIONS[language]?.[key] || key;
    Object.keys(params).forEach(k => {
        str = str.replace(`{{${k}}}`, params[k]);
    });
    return str;
  };

  useEffect(() => {
    // 移除 system 逻辑，直接根据 themeMode 判断
    setIsDarkMode(themeMode === 'dark');
  }, [themeMode]);

  return (
    <RootContext.Provider value={{ 
      language, setLanguage, 
      themeMode, setThemeMode, 
      isDarkMode, t,
      appVersion: APP_VERSION,
      isTagSidebarVisible, setIsTagSidebarVisible,
      isTemplatesSidebarVisible, setIsTemplatesSidebarVisible,
      isBanksSidebarVisible, setIsBanksSidebarVisible,
    }}>
      {children}
    </RootContext.Provider>
  );
};

export const useRootContext = () => useContext(RootContext);
