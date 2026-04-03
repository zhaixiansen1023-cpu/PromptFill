import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

const VIDEO_FEATURE_ENABLED = import.meta.env.VITE_VIDEO_ENABLED === 'true';
import { Link, useLocation } from 'react-router-dom';
import { AppStoreIcon } from './icons/AppStoreIcon';
import { FlaskIcon } from './icons/FlaskIcon';
import { GithubIcon } from './icons/GithubIcon';
import { HomeIcon } from './icons/HomeIcon';
import { ListIcon } from './icons/ListIcon';
import { VideoIcon } from './icons/VideoIcon';
import { OrderIcon } from './icons/OrderIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { TranslateIcon } from './icons/TranslateIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { SunDimIcon } from './icons/SunDimIcon';
import { SunMoonIcon } from './icons/SunMoonIcon';
import { MoonIcon } from './icons/MoonIcon';
// import { CoffeeIcon } from './icons/CoffeeIcon';
import { Tooltip } from './Tooltip';
import { openExternalLink } from '../utils/platform';
// import SponsorModal from './modals/SponsorModal';

/**
 * Sidebar 组件 - 通用侧边导航栏
 */
export const Sidebar = ({
  activeTab = 'home', // 'home' | 'detail' | 'settings'
  // Sort props
  isSortMenuOpen,
  setIsSortMenuOpen,
  sortOrder,
  setSortOrder,
  setRandomSeed,
  // Actions
  onRefresh,
  // I18n
  language,
  setLanguage,
  // Theme
  isDarkMode,
  themeMode,
  setThemeMode,
  t,
  isEmbedded = false,
  embeddedInline = false
}) => {
  const location = useLocation();
  const hideEmbeddedToolbar = isEmbedded && !embeddedInline && (activeTab === 'settings' || activeTab === 'home');
  const isCompactEmbeddedToolbar = isEmbedded && embeddedInline;
  const embeddedIconSize = isCompactEmbeddedToolbar ? 18 : (isEmbedded ? 20 : 24);
  const embeddedButtonPadding = isCompactEmbeddedToolbar ? 'p-1' : (isEmbedded ? 'p-1.5' : 'p-2');

  if (hideEmbeddedToolbar) {
    return null;
  }

  // const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const embeddedCardStyle = isDarkMode ? {
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    background: 'linear-gradient(180deg, rgba(35, 35, 38, 0.82) 0%, rgba(23, 24, 26, 0.9) 100%)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
  } : {
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.58)',
    background: 'linear-gradient(180deg, rgba(255, 250, 245, 0.8) 0%, rgba(248, 232, 215, 0.68) 100%)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.58), 0 18px 36px rgba(180, 120, 80, 0.14)',
  };

  // 统一的容器样式
  const containerStyle = isDarkMode ? {
    width: isCompactEmbeddedToolbar ? '100%' : (isEmbedded ? '140px' : '62px'),
    height: isEmbedded ? 'auto' : '100%',
    borderRadius: isEmbedded ? '0' : '16px',
    border: '1px solid transparent',
    background: 'transparent',
  } : {
    width: isCompactEmbeddedToolbar ? '100%' : (isEmbedded ? '140px' : '62px'),
    height: isEmbedded ? 'auto' : '100%',
    borderRadius: isEmbedded ? '0' : '16px',
    border: '1px solid transparent',
    background: 'transparent',
  };

  return (
    <aside 
      style={containerStyle}
      className={`relative flex ${isEmbedded ? (embeddedInline ? 'flex-row items-center p-0 w-full mb-2' : 'absolute left-0 top-0 flex-row items-center p-0') : 'flex-col justify-between items-center py-1 mr-4'} flex-shrink-0 transition-all duration-300 z-[20]`}
    >
      {/* 上部分：Logo (仅非嵌入模式显示) + 导航按钮 */}
      <div
        style={isEmbedded ? embeddedCardStyle : undefined}
        className={`flex ${isEmbedded ? (isCompactEmbeddedToolbar ? 'w-full flex-row items-center justify-center px-1.5 py-1.5' : 'w-full flex-row items-center justify-between px-2 py-1.5') : 'flex-col'} items-center ${isEmbedded ? '' : 'gap-5 w-full'}`}
      >
        {/* Logo (仅独立模式显示) */}
        {!isEmbedded && (
          <div>
            <LogoIcon className="w-9 h-9" />
          </div>
        )}

        {/* 导航按钮组 */}
        <div className={`flex ${isEmbedded ? (isCompactEmbeddedToolbar ? 'flex-row items-center justify-center gap-0.5 mx-auto' : 'w-full flex-row items-center justify-between gap-0.5') : 'flex-col'} items-center ${isEmbedded ? '' : 'gap-4'}`}>
          <Tooltip content="主页" isDarkMode={isDarkMode}>
            <Link
              to="/explore"
              className={`${embeddedButtonPadding} group transition-colors block ${activeTab === 'home' ? (isDarkMode ? 'text-[#FB923C]' : 'text-[#EA580C]') : (isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]')} hover:text-[#F97316]`}
            >
              <HomeIcon size={embeddedIconSize} />
            </Link>
          </Tooltip>

          <Tooltip content="详情页" isDarkMode={isDarkMode}>
            <Link
              to="/detail"
              className={`${embeddedButtonPadding} group transition-colors block ${activeTab === 'detail' ? (isDarkMode ? 'text-[#FB923C]' : 'text-[#EA580C]') : (isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]')} hover:text-[#F97316]`}
            >
              <ListIcon size={embeddedIconSize} />
            </Link>
          </Tooltip>

          {VIDEO_FEATURE_ENABLED && (
            <Tooltip content="视频编辑" isDarkMode={isDarkMode}>
              <Link
                to="/video"
                className={`${embeddedButtonPadding} group transition-colors block ${location?.pathname?.startsWith('/video') ? (isDarkMode ? 'text-[#FB923C]' : 'text-[#EA580C]') : (isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]')} hover:text-[#F97316]`}
              >
                <VideoIcon size={embeddedIconSize} />
              </Link>
            </Tooltip>
          )}

          {import.meta.env.DEV && (
            <Tooltip content="UI Test" isDarkMode={isDarkMode}>
              <Link
                to="/ui-test"
                className={`${embeddedButtonPadding} group transition-colors block ${location?.pathname === '/ui-test' ? (isDarkMode ? 'text-[#FB923C]' : 'text-[#EA580C]') : (isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]')} hover:text-[#F97316]`}
              >
                <FlaskIcon size={embeddedIconSize} />
              </Link>
            </Tooltip>
          )}
          
          <div className="relative">
            <Tooltip content={t('sort')} isDarkMode={isDarkMode}>
              <button 
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                className={`${embeddedButtonPadding} group transition-colors ${isSortMenuOpen ? (isDarkMode ? 'text-[#FB923C]' : 'text-[#EA580C]') : (isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]')} hover:text-[#F97316]`}
              >
                <OrderIcon size={embeddedIconSize} />
              </button>
            </Tooltip>
            
            {isSortMenuOpen && (
              <div className={`absolute ${isEmbedded ? (isCompactEmbeddedToolbar ? 'left-1/2 top-full mt-2 -translate-x-1/2' : 'left-0 top-full mt-2') : 'left-full ml-4 bottom-0'} backdrop-blur-xl rounded-2xl shadow-2xl border py-2 min-w-[160px] z-[110] animate-in slide-in-from-left-2 duration-200 ${isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white/95 border-white/60'}`}>
                {[
                  { value: 'newest', label: t('sort_newest') },
                  { value: 'oldest', label: t('sort_oldest') },
                  { value: 'a-z', label: t('sort_az') },
                  { value: 'z-a', label: t('sort_za') },
                  { value: 'random', label: t('sort_random') }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOrder(option.value);
                      if (option.value === 'random') setRandomSeed(Date.now());
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${sortOrder === option.value ? 'text-orange-600 font-semibold' : (isDarkMode ? 'text-gray-400 hover:bg-white/10' : 'text-gray-700 hover:bg-orange-50')}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Tooltip content={t('refresh_desc')} isDarkMode={isDarkMode}>
            <button 
              onClick={onRefresh}
              className={`${embeddedButtonPadding} group transition-colors ${isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]'} hover:text-[#F97316]`}
            >
              <RefreshIcon size={embeddedIconSize} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* 下部分：设置组 (嵌入模式下隐藏大部分) */}
      {!isEmbedded && (
        <div className="flex flex-col items-center gap-4 w-full">
          <Tooltip content={t('language')} isDarkMode={isDarkMode}>
            <button 
              onClick={() => setLanguage(language === 'cn' ? 'en' : 'cn')}
              className={`p-2 group transition-colors ${isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]'} hover:text-[#F97316]`}
            >
              <TranslateIcon size={24} />
            </button>
          </Tooltip>

          <Tooltip content={themeMode === 'system' ? 'Follow System' : (themeMode === 'dark' ? 'Dark Mode' : 'Light Mode')} isDarkMode={isDarkMode}>
            <button 
              onClick={() => {
                if (themeMode === 'light') setThemeMode('dark');
                else setThemeMode('light');
              }}
              className={`p-2 group relative transition-colors ${isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]'} hover:text-[#F97316]`}
            >
              {themeMode === 'dark' ? <MoonIcon size={24} /> : <SunDimIcon size={24} />}
            </button>
          </Tooltip>

          <Tooltip content={t('settings')} isDarkMode={isDarkMode}>
            <Link
              to="/setting"
              className={`p-2 group transition-colors block ${activeTab === 'settings' ? (isDarkMode ? 'text-[#FB923C]' : 'text-[#EA580C]') : (isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]')} hover:text-[#F97316]`}
            >
              <SettingsIcon size={24} />
            </Link>
          </Tooltip>

          <Tooltip content="App Store" isDarkMode={isDarkMode}>
            <button
              onClick={() => openExternalLink('https://apps.apple.com/cn/app/%E6%8F%90%E7%A4%BA%E8%AF%8D%E5%A1%AB%E7%A9%BA%E5%99%A8/id6758574801')}
              className={`p-2 transition-colors ${isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]'} hover:text-[#F97316]`}
            >
              <AppStoreIcon size={24} />
            </button>
          </Tooltip>

          <Tooltip content="Github" isDarkMode={isDarkMode}>
            <button
              onClick={() => openExternalLink('https://github.com/TanShilongMario/PromptFill/')}
              className={`p-2 transition-colors ${isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]'} hover:text-[#F97316]`}
            >
              <GithubIcon size={24} />
            </button>
          </Tooltip>

          {/* 捐赠按钮 - 暂时隐藏
          <Tooltip content={language === 'cn' ? '请我喝杯奶茶' : 'Buy me a bubble tea'} isDarkMode={isDarkMode}>
            <button
              onClick={() => setIsSponsorModalOpen(true)}
              className={`p-2 transition-colors ${isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]'} hover:text-orange-500`}
            >
              <CoffeeIcon size={24} />
            </button>
          </Tooltip>
          */}
        </div>
      )}

      {/* 打赏弹窗 - 暂时隐藏
      <SponsorModal
        isOpen={isSponsorModalOpen}
        onClose={() => setIsSponsorModalOpen(false)}
        isDarkMode={isDarkMode}
        language={language}
      />
      */}
    </aside>
  );
};

