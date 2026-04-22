import React, { useState } from 'react';
import { PanelLeft, PanelRight } from 'lucide-react';
import { TAG_LABELS } from '../constants/styles';
import { useRootContext } from '../context/RootContext';
import { Tooltip } from './Tooltip';
import ChevronDownIcon from './icons/ChevronDownIcon';
import { EmbeddedToolbar } from './EmbeddedToolbar';

const PanelCenterIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" strokeDasharray="3 2" />
    <line x1="15" y1="3" x2="15" y2="21" strokeDasharray="3 2" />
  </svg>
);


const PanelToggleButton = ({ isVisible, onClick, icon: Icon, tooltip, isDarkMode, isCollapsed = false }) => (
  <Tooltip content={tooltip} isDarkMode={isDarkMode} position="top">
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center rounded-2xl transition-all duration-200 ease-out ${
        isCollapsed ? 'w-9 h-9' : 'w-full h-9'
      } ${
        isVisible
          ? isDarkMode
            ? 'text-orange-400 bg-orange-500/15 hover:bg-orange-500/25 active:scale-95 active:bg-orange-500/30'
            : 'text-orange-600 bg-orange-500/12 hover:bg-orange-500/20 active:scale-95 active:bg-orange-500/25'
          : isDarkMode
            ? 'text-gray-500 hover:text-gray-300 hover:bg-white/8 active:scale-95 active:bg-white/12'
            : 'text-gray-400 hover:text-gray-600 hover:bg-black/6 active:scale-95 active:bg-black/10'
      }`}
    >
      <Icon size={15} strokeWidth={1.8} />
    </button>
  </Tooltip>
);

/**
 * TagSidebar 组件 - 侧边 Tag 栏
 * 包含库源筛选、类型筛选和标签筛选功能
 */
export const TagSidebar = ({
  // 数据和状态
  TEMPLATE_TAGS = [],
  availableTags,
  selectedTags = '',
  selectedLibrary = 'all',
  selectedType = 'all',

  // 回调函数
  setSelectedTags,
  setSelectedLibrary,
  setSelectedType,

  isSortMenuOpen = false,
  setIsSortMenuOpen,
  sortOrder = 'newest',
  setSortOrder,
  setRandomSeed,
  handleRefresh,
  t = (key) => key,
  activeTab = 'detail',
  showTopControls = false,

  // 样式和主题
  isDarkMode = false,
  language = 'cn',
  topOffset = 0
}) => {
  const [tagsCollapsed, setTagsCollapsed] = useState(false);
  const {
    isTagSidebarVisible,
    setIsTagSidebarVisible,
    isTemplatesSidebarVisible,
    setIsTemplatesSidebarVisible,
    isBanksSidebarVisible,
    setIsBanksSidebarVisible,
  } = useRootContext();

  const isCollapsed = !isTagSidebarVisible;
  const sortOptions = [
    { value: 'newest', label: t('sort_newest') },
    { value: 'oldest', label: t('sort_oldest') },
    { value: 'a-z', label: t('sort_az') },
    { value: 'z-a', label: t('sort_za') },
    { value: 'random', label: t('sort_random') },
  ];

  // 如果是移动设备，不渲染此组件
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  if (isMobile) {
    return null;
  }

  // 通用按钮样式生成器
  const getButtonClass = (isActive) => `w-full text-left px-3 py-3 rounded-2xl transition-all duration-300 group ${
    isActive
      ? (isDarkMode ? 'bg-[#F48B42]/10 text-[#FB923C]' : 'bg-[#F9BC8F]/20 text-[#EA580C]')
      : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50/50')
  }`;

  const getSpanClass = (isActive) => `text-sm font-bold ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform inline-block`;
  const sidebarContainerStyle = isDarkMode ? {
    borderRadius: '24px',
    border: '1px solid transparent',
    backgroundImage: 'linear-gradient(180deg, #3B3B3B 0%, #242120 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    boxShadow: '0 18px 36px rgba(3, 8, 18, 0.24)',
  } : {
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.50)',
    background: 'linear-gradient(180deg, rgba(255, 250, 245, 0.58) 0%, rgba(248, 232, 215, 0.50) 100%)',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 2px 24px rgba(180, 120, 80, 0.08)',
  };

  return (
    <div
      className="hidden lg:flex relative z-[15] flex-col flex-shrink-0 h-full overflow-hidden transition-[width] duration-300 ease-out"
      style={{
        width: isCollapsed ? '76px' : '140px',
        marginTop: topOffset > 0 ? `${topOffset}px` : 0,
        height: topOffset > 0 ? `calc(100% - ${topOffset}px)` : '100%'
      }}
    >
      {/* 内层与 TemplatesSidebar/BanksSidebar 一致：圆角+背景，标题区从内层顶开始算 pt-4 */}
      <div
        className="flex flex-col w-full h-full overflow-hidden"
        style={sidebarContainerStyle}
      >
        {/* 顶部标题区：将原独立按钮栏并入筛选栏顶部 */}
        <div className={`flex-shrink-0 ${isCollapsed ? 'px-3 pb-3' : 'px-4 pb-4'}`} style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}>
          {showTopControls && (
            <EmbeddedToolbar
              activeTab={activeTab}
              isDarkMode={isDarkMode}
              language={language}
              t={t}
              isCollapsed={isCollapsed}
              isSortMenuOpen={isSortMenuOpen}
              setIsSortMenuOpen={setIsSortMenuOpen}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              setRandomSeed={setRandomSeed}
              sortOptions={sortOptions}
              handleRefresh={handleRefresh}
            />
          )}

          {!isCollapsed && (
            <div className="px-2">
              <div className="min-h-10 flex items-center justify-between">
                <h1 className={`text-[20px] font-bold tracking-tight flex items-baseline gap-2 ${isDarkMode ? 'text-[#CDCDCD]' : 'text-[#5D5D5D]'}`}>
                  {language === 'cn' ? '筛选' : 'Filter'}
                </h1>
              </div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <>
            {/* 库源筛选 - 固定顶部 */}
            <div className="flex flex-col gap-3 flex-shrink-0 px-3">
              <h3 className={`text-xs font-bold uppercase px-3 opacity-50 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {language === 'cn' ? '库源' : 'Library'}
              </h3>
              <div className="flex flex-col gap-1">
                {[
                  { id: 'all', cn: '全部', en: 'All' },
                  { id: 'official', cn: '官方库', en: 'Official' },
                  { id: 'personal', cn: '个人库', en: 'Personal' }
                ].map(lib => (
                  <button
                    key={lib.id}
                    onClick={() => setSelectedLibrary(lib.id)}
                    className={getButtonClass(selectedLibrary === lib.id)}
                  >
                    <span className={getSpanClass(selectedLibrary === lib.id)}>
                      {language === 'cn' ? lib.cn : lib.en}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 类型筛选 - 固定在库源下方 */}
            <div className="flex flex-col gap-3 flex-shrink-0 mt-8 px-3">
              <h3 className={`text-xs font-bold uppercase px-3 opacity-50 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {language === 'cn' ? '类型' : 'Type'}
              </h3>
              <div className="flex flex-col gap-1">
                {[
                  { id: 'all', cn: '全部', en: 'All' },
                  { id: 'image', cn: '图片', en: 'Image' },
                  { id: 'video', cn: '视频', en: 'Video' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={getButtonClass(selectedType === type.id)}
                  >
                    <span className={getSpanClass(selectedType === type.id)}>
                      {language === 'cn' ? type.cn : type.en}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 标签筛选 - 可折叠，与库源/类型样式一致，三角在右侧 */}
            <div className="flex flex-col gap-3 mt-8 min-h-0 flex-1 overflow-hidden px-3">
              <button
                type="button"
                onClick={() => setTagsCollapsed((c) => !c)}
                className={`flex items-center gap-2 w-full text-left px-3 py-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
              >
                <h3 className={`text-xs font-bold uppercase opacity-50 pointer-events-none flex-shrink-0 text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {language === 'cn' ? '标签' : 'Tags'}
                </h3>
                <ChevronDownIcon isOpen={!tagsCollapsed} size={14} className={`opacity-50 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
              {!tagsCollapsed && (
                <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pb-4">
                  <button
                    onClick={() => setSelectedTags('')}
                    className={getButtonClass(selectedTags === '')}
                  >
                    <span className={getSpanClass(selectedTags === '')}>
                      {language === 'cn' ? '全部' : 'All'}
                    </span>
                  </button>

                  {(availableTags || TEMPLATE_TAGS).map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTags(tag)}
                      className={getButtonClass(selectedTags === tag)}
                    >
                      <span className={getSpanClass(selectedTags === tag)}>
                        {language === 'cn' ? (TAG_LABELS.cn[tag] || tag) : (TAG_LABELS.en[tag] || tag)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className={`mt-auto flex-shrink-0 border-t ${isCollapsed ? 'px-3 py-3' : 'px-3 py-4'}`} style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(234,88,12,0.08)' }}>
          <div className={`grid ${isCollapsed ? 'grid-cols-1' : 'grid-cols-3'} gap-1`}>
            <PanelToggleButton
              isVisible={isTagSidebarVisible}
              onClick={() => setIsTagSidebarVisible((value) => !value)}
              icon={PanelLeft}
              tooltip={isTagSidebarVisible ? '隐藏分类栏' : '显示分类栏'}
              isDarkMode={isDarkMode}
              isCollapsed={isCollapsed}
            />
            <PanelToggleButton
              isVisible={isTemplatesSidebarVisible}
              onClick={() => setIsTemplatesSidebarVisible((value) => !value)}
              icon={PanelCenterIcon}
              tooltip={isTemplatesSidebarVisible ? '隐藏模版列表' : '显示模版列表'}
              isDarkMode={isDarkMode}
              isCollapsed={isCollapsed}
            />
            <PanelToggleButton
              isVisible={isBanksSidebarVisible}
              onClick={() => setIsBanksSidebarVisible((value) => !value)}
              icon={PanelRight}
              tooltip={isBanksSidebarVisible ? '隐藏词库栏' : '显示词库栏'}
              isDarkMode={isDarkMode}
              isCollapsed={isCollapsed}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
