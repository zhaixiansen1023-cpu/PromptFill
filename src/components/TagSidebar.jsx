import React, { useState } from 'react';
import { TAG_LABELS } from '../constants/styles';
import ChevronDownIcon from './icons/ChevronDownIcon';

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

  // 样式和主题
  isDarkMode = false,
  language = 'cn',
  topOffset = 0
}) => {
  const [tagsCollapsed, setTagsCollapsed] = useState(false);

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

  return (
    <div
      className="hidden lg:flex flex-col flex-shrink-0 h-full overflow-hidden"
      style={{
        width: '140px',
        marginTop: topOffset > 0 ? `${topOffset}px` : 0,
        height: topOffset > 0 ? `calc(100% - ${topOffset}px)` : '100%'
      }}
    >
      {/* 内层与 TemplatesSidebar/BanksSidebar 一致：圆角+背景，标题区从内层顶开始算 pt-4 */}
      <div
        className="flex flex-col w-full h-full overflow-hidden"
        style={isDarkMode ? {
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'linear-gradient(180deg, rgba(29, 31, 36, 0.97) 0%, rgba(16, 17, 21, 0.99) 100%)',
          boxShadow: '0 18px 36px rgba(3, 8, 18, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        } : {
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.50)',
          background: 'linear-gradient(180deg, rgba(255, 250, 245, 0.58) 0%, rgba(248, 232, 215, 0.50) 100%)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 2px 24px rgba(180, 120, 80, 0.08)',
        }}
      >
        {/* 顶部标题区：24px + 安全区，与其他三块面板一致 */}
        <div className="px-6 pb-4 flex-shrink-0" style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}>
          <div className="min-h-10 flex items-center justify-between">
            <h1 className={`text-[20px] font-bold tracking-tight flex items-baseline gap-2 ${isDarkMode ? 'text-[#CDCDCD]' : 'text-[#5D5D5D]'}`}>
              {language === 'cn' ? '筛选' : 'Filter'}
            </h1>
          </div>
        </div>

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
      </div>
    </div>
  );
};
