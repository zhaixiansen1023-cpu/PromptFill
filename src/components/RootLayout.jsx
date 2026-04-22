import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './';
import { AppFooter } from './AppFooter';
import { useRootContext } from '../context/RootContext';
import { isMobile } from '../utils/platform';

/**
 * RootLayout - 全局布局容器
 * 负责渲染持久 UI（侧边栏、灯、Footer）
 */
export const RootLayout = ({ children }) => {
  const location = useLocation();
  const { isDarkMode, language, t, themeMode, setThemeMode, setLanguage, appVersion } = useRootContext();
  
  const [isMobileDevice, setIsMobileDevice] = useState(isMobile());
  const isEmbedded = window.self !== window.top;
  const isStandaloneScrollablePage = location.pathname === '/privacy';
  const shouldLockViewport = !isEmbedded && !isMobileDevice && !isStandaloneScrollablePage;
  const shouldShowRootSidebar = !isMobileDevice && !isEmbedded;
  const shellHeightClass = shouldLockViewport
    ? 'h-screen h-[100dvh] max-h-[100dvh]'
    : 'min-h-screen min-h-[100dvh] h-full';

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => setIsMobileDevice(isMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 直接由路径计算激活 tab，无需额外 state
  const activeTab = (() => {
    if (location.pathname.startsWith('/video')) return 'video';
    if (location.pathname === '/setting') return 'settings';
    if (location.pathname === '/detail') return 'detail';
    return 'home'; // /explore 及其他
  })();

  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [sortOrder, setSortOrderState] = useState('newest');

  const handleSetSortOrder = (value) => {
    setSortOrderState(value);
    window.dispatchEvent(new CustomEvent('app-set-sort-order', { detail: value }));
  };

  const handleSetRandomSeed = (seed) => {
    window.dispatchEvent(new CustomEvent('app-set-random-seed', { detail: seed }));
  };

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent('app-nav-refresh'));
  };

  // 同步 theme-color
  useEffect(() => {
    const themeColor = isDarkMode ? '#181716' : '#D6D6D6';
    let meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', themeColor);
  }, [isDarkMode]);

  // 桌面独立页使用固定视口高度，确保主页/详情页只在内部容器滚动。
  useEffect(() => {
    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    if (shouldLockViewport) {
      body.style.overflow = 'hidden';
      documentElement.style.overflow = 'hidden';
    }

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [shouldLockViewport]);

  return (
    <div 
      className={`relative flex ${isEmbedded ? 'flex-col' : 'flex-row'} ${shellHeightClass} w-full max-w-full overflow-hidden p-0 md:py-6 ${isEmbedded ? 'md:pl-28 md:pr-10' : 'md:px-10'} select-none transition-colors duration-300 ${
        isDarkMode ? 'dark-mode dark-gradient-bg' : 'mesh-gradient-bg'
      }`}
    >
      {/* Mesh gradient orbs — light mode only, each animates independently */}
      {!isDarkMode && (
        <div className="mesh-orbs-container" aria-hidden="true">
          {/* SVG noise filter for grain texture */}
          <svg className="mesh-noise-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="mesh-noise" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
                <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
                <feBlend in="SourceGraphic" in2="grayNoise" mode="soft-light" result="blended" />
                <feComposite in="blended" in2="SourceGraphic" operator="in" />
              </filter>
            </defs>
          </svg>

          {/* Base orbs — full viewport coverage */}
          <div className="mesh-orb mesh-orb-1" />
          <div className="mesh-orb mesh-orb-2" />
          <div className="mesh-orb mesh-orb-3" />
          <div className="mesh-orb mesh-orb-4" />
          <div className="mesh-orb mesh-orb-5" />

          {/* Nebula cluster — bottom-right chaos orbs */}
          <div className="mesh-orb mesh-nebula-1" />
          <div className="mesh-orb mesh-nebula-2" />
          <div className="mesh-orb mesh-nebula-3" />
          <div className="mesh-orb mesh-nebula-4" />
          <div className="mesh-orb mesh-nebula-5" />

          {/* Grain overlay — covers entire container */}
          <div className="mesh-grain-overlay" />
        </div>
      )}
      {shouldShowRootSidebar && (
        <Sidebar
          activeTab={activeTab}
          isSortMenuOpen={isSortMenuOpen}
          setIsSortMenuOpen={setIsSortMenuOpen}
          sortOrder={sortOrder}
          setSortOrder={handleSetSortOrder}
          setRandomSeed={handleSetRandomSeed}
          onRefresh={handleRefresh}
          language={language}
          setLanguage={setLanguage}
          isDarkMode={isDarkMode}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          t={t}
          isEmbedded={isEmbedded}
        />
      )}
      


      <div className="flex-1 h-full min-w-0 min-h-0 flex flex-col relative z-[1]">
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
        {!isMobileDevice && (
          <AppFooter appVersion={appVersion} isDarkMode={isDarkMode} />
        )}
      </div>
    </div>
  );
};
