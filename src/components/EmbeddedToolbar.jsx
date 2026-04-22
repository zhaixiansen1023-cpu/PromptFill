import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Home, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tooltip } from './Tooltip';
import { ListIcon } from './icons/ListIcon';
import { OrderIcon } from './icons/OrderIcon';
import { RefreshIcon } from './icons/RefreshIcon';

const ToolbarLinkButton = ({ to, active, icon: Icon, tooltip, isDarkMode, isCollapsed = false }) => (
  <Tooltip content={tooltip} isDarkMode={isDarkMode} position="bottom">
    <Link
      to={to}
      className={`flex items-center justify-center rounded-2xl transition-all duration-200 ${
        isCollapsed ? 'w-9 h-9' : 'w-full h-9'
      } ${
        active
          ? isDarkMode
            ? 'bg-orange-500/16 text-[#FB923C]'
            : 'bg-orange-500/12 text-[#EA580C]'
          : isDarkMode
            ? 'text-gray-400 hover:text-white hover:bg-white/6'
            : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50/70'
      }`}
    >
      <Icon size={16} strokeWidth={2} />
    </Link>
  </Tooltip>
);

const ToolbarActionButton = ({ onClick, active = false, icon: Icon, tooltip, isDarkMode, isCollapsed = false }) => (
  <Tooltip content={tooltip} isDarkMode={isDarkMode} position="bottom">
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-2xl transition-all duration-200 ${
        isCollapsed ? 'w-9 h-9' : 'w-full h-9'
      } ${
        active
          ? isDarkMode
            ? 'bg-orange-500/16 text-[#FB923C]'
            : 'bg-orange-500/12 text-[#EA580C]'
          : isDarkMode
            ? 'text-gray-400 hover:text-white hover:bg-white/6'
            : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50/70'
      }`}
    >
      <Icon size={16} strokeWidth={2} />
    </button>
  </Tooltip>
);

/**
 * EmbeddedToolbar - 嵌入模式下的导航工具栏
 * 在 Home / Detail / Settings 页面都一致渲染
 */
export const EmbeddedToolbar = ({
  activeTab = 'detail',
  isDarkMode = false,
  language = 'cn',
  t = (key) => key,
  isCollapsed = false,
  // Sort (可选，仅在需要排序功能的页面传入)
  isSortMenuOpen,
  setIsSortMenuOpen,
  sortOrder,
  setSortOrder,
  setRandomSeed,
  sortOptions,
  handleRefresh,
}) => {
  const showSortRefresh = typeof setIsSortMenuOpen === 'function';
  const sortTriggerRef = useRef(null);
  const [sortMenuStyle, setSortMenuStyle] = useState(null);

  useLayoutEffect(() => {
    if (!isSortMenuOpen || !sortTriggerRef.current) {
      setSortMenuStyle(null);
      return undefined;
    }

    const updatePosition = () => {
      const rect = sortTriggerRef.current.getBoundingClientRect();

      setSortMenuStyle({
        position: 'fixed',
        top: isCollapsed ? `${rect.top + (rect.height / 2)}px` : `${rect.bottom + 8}px`,
        left: isCollapsed ? `${rect.right + 8}px` : `${rect.left + (rect.width / 2)}px`,
        transform: isCollapsed ? 'translateY(-50%)' : 'translateX(-50%)'
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isCollapsed, isSortMenuOpen]);

  const sortMenu = isSortMenuOpen && sortMenuStyle && typeof document !== 'undefined'
    ? createPortal(
      <div
        style={sortMenuStyle}
        className={`min-w-[160px] z-[1400] backdrop-blur-xl rounded-2xl shadow-2xl border py-2 animate-in slide-in-from-top-2 duration-200 ${isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white/95 border-white/60'}`}
      >
        {(sortOptions || []).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setSortOrder?.(option.value);
              if (option.value === 'random') {
                setRandomSeed?.(Date.now());
              }
              setIsSortMenuOpen?.(false);
            }}
            className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${sortOrder === option.value ? 'text-orange-600 font-semibold' : (isDarkMode ? 'text-gray-400 hover:bg-white/10' : 'text-gray-700 hover:bg-orange-50')}`}
          >
            {option.label}
          </button>
        ))}
      </div>,
      document.body
    )
    : null;

  return (
    <>
      <div className={`${isCollapsed ? 'mb-3' : 'mb-4'} relative`}>
        <div className={`grid ${isCollapsed ? 'grid-cols-1' : (showSortRefresh ? 'grid-cols-4' : 'grid-cols-2')} gap-1`}>
        <ToolbarLinkButton
          to="/explore"
          active={activeTab === 'home'}
          icon={Home}
          tooltip={language === 'cn' ? '主页' : 'Home'}
          isDarkMode={isDarkMode}
          isCollapsed={isCollapsed}
        />
        <ToolbarLinkButton
          to="/detail"
          active={activeTab === 'detail'}
          icon={ListIcon}
          tooltip={language === 'cn' ? '详情页' : 'Detail'}
          isDarkMode={isDarkMode}
          isCollapsed={isCollapsed}
        />
        {showSortRefresh && (
          <>
            <div ref={sortTriggerRef} className="relative flex items-center justify-center">
              <ToolbarActionButton
                onClick={() => setIsSortMenuOpen?.((prev) => !prev)}
                active={isSortMenuOpen}
                icon={OrderIcon}
                tooltip={t('sort')}
                isDarkMode={isDarkMode}
                isCollapsed={isCollapsed}
              />
            </div>
            <ToolbarActionButton
              onClick={handleRefresh}
              icon={RefreshIcon}
              tooltip={t('refresh_desc')}
              isDarkMode={isDarkMode}
              isCollapsed={isCollapsed}
            />
          </>
        )}
        </div>
      </div>
      {sortMenu}
    </>
  );
};

// 导出按钮组件供 TagSidebar 等复用
export { ToolbarLinkButton, ToolbarActionButton };
