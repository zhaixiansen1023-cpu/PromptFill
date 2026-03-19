// VisualEditor 组件 - 可视化编辑器
import React, { useRef } from 'react';
import { CATEGORY_STYLES } from '../constants/styles';

export const VisualEditor = React.forwardRef(({ 
  value, 
  onChange, 
  banks, 
  categories, 
  isDarkMode,
  // 移动端常驻标题与作者
  activeTemplate,
  language,
  t,
  onInteraction // 新增：交互回调（用于自动折叠信息区）
}, ref) => {
  const preRef = useRef(null);
  const containerRef = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleScroll = (e) => {
    if (preRef.current && !isMobile) {
      preRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // 同步滚动 (仅移动端启用)
  const handleContainerScroll = (e) => {
    if (isMobile && preRef.current) {
      // 实际上在移动端，我们将 pre 和 textarea 放在一个非绝对定位的容器中，
      // 让它们随父容器一起滚动，而不是自己拥有滚动条。
    }
  };

  // ... 变量解析工具函数 ...
  const parseVariableName = (varName) => {
    const match = varName.match(/^(.+?)(?:_(\d+))?$/);
    if (match) {
      return {
        baseKey: match[1],
        groupId: match[2] || null
      };
    }
    return { baseKey: varName, groupId: null };
  };

  // 解析 {{A: val}} 或 {{A}} 语法，返回 { varPart, inlineVal }
  const parseInlineSyntax = (raw) => {
    const colonIdx = raw.indexOf(':');
    if (colonIdx === -1) return { varPart: raw.trim(), inlineVal: null };
    return {
      varPart: raw.slice(0, colonIdx).trim(),
      inlineVal: raw.slice(colonIdx + 1).trim(),
    };
  };

  const renderHighlights = (text) => {
    if (!text || typeof text !== 'string') return null;
    // Split by {{...}}
    const parts = text.split(/(\{\{[^{}\n]+\}\})/g);
    return parts.map((part, i) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        const rawInner = part.slice(2, -2);
        const { varPart, inlineVal } = parseInlineSyntax(rawInner);

        // 解析变量名，提取 baseKey（用于查找词库）
        const parsed = parseVariableName(varPart);
        const baseKey = parsed.baseKey;
        
        // 使用 baseKey 查找词库
        const bank = banks[baseKey] || banks[varPart];
        const categoryId = bank?.category || 'other';
        const colorKey = categories[categoryId]?.color || 'slate';
        const style = CATEGORY_STYLES[colorKey];
        
        // 仅用背景色+文字色高亮，不改变字重/圆角，否则与 textarea 字宽不一致导致光标错位
        const bgClass = isDarkMode ? `${style.bg}/20 ${style.text}` : `${style.bg} ${style.text}`;

        return (
          <span key={i} data-export-pill="true" className={bgClass}>
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // 移动端布局：标题作者和编辑器一起滚动
  if (isMobile) {
    const title = activeTemplate ? (typeof activeTemplate.name === 'object' ? (activeTemplate.name[language] || activeTemplate.name.cn || activeTemplate.name.en) : activeTemplate.name) : '';
    const author = activeTemplate ? activeTemplate.author : '';

    return (
      <div 
        ref={containerRef}
        onScroll={(e) => {
          handleContainerScroll(e);
          if (onInteraction) onInteraction();
        }}
        onClick={() => {
          if (onInteraction) onInteraction();
        }}
        className={`w-full h-full overflow-y-auto overflow-x-hidden flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#2A2928]' : 'bg-[#FBF5EE]/80'}`}
      >
        {/* Mobile Header in Scrollable Area */}
        <div className="px-6 pt-10 pb-6 shrink-0">
          <h1 className={`text-2xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h1>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {language === 'cn' ? '作者' : 'Author'}:
            </span>
            <span className="text-sm font-bold text-orange-500">
              {author === '官方' ? (t ? t('official') : '官方') : (author || (t ? t('official') : '官方'))}
            </span>
          </div>
        </div>

        {/* Editor Area */}
        <div className="relative flex-1 px-6 pb-20">
          <pre
            ref={preRef}
            className={`w-full font-mono text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none m-0 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}
            style={{ 
              fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              minHeight: '200px'
            }} 
            aria-hidden="true"
          >
            {renderHighlights(value)}
            <br />
          </pre>

          <textarea
            ref={ref}
            value={value}
            onChange={onChange}
            onFocus={() => {
              if (onInteraction) onInteraction();
            }}
            spellCheck={false}
            className={`absolute inset-0 w-full h-full px-6 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words bg-transparent text-transparent resize-none focus:outline-none z-10 m-0 selection:bg-orange-500/30 ${isDarkMode ? 'caret-white selection:text-white' : 'caret-gray-800 selection:bg-orange-200 selection:text-orange-900'}`}
            style={{ 
              fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              overflow: 'hidden' // 让父容器处理滚动
            }}
          />
        </div>
      </div>
    );
  }

  // 桌面端布局保持原样
  return (
    <div className={`relative w-full h-full overflow-hidden transition-colors duration-300 bg-transparent`}>
      {/* Backdrop */}
      <pre
        ref={preRef}
        className={`absolute inset-0 p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none overflow-hidden m-0 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}
        style={{ fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }} 
        aria-hidden="true"
      >
        {renderHighlights(value)}
        <br />
      </pre>

      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        className={`absolute inset-0 w-full h-full p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words bg-transparent text-transparent resize-none focus:outline-none overflow-y-auto z-10 m-0 selection:bg-orange-500/30 ${isDarkMode ? 'caret-white selection:text-white' : 'caret-gray-800 selection:bg-orange-200 selection:text-orange-900'}`}
        style={{ fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
        spellCheck={false}
      />
    </div>
  );
});

VisualEditor.displayName = 'VisualEditor';
