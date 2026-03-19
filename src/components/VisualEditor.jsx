// VisualEditor 组件 - ContentEditable 可视化编辑器
import React, { useRef, useEffect, useCallback, useImperativeHandle } from 'react';
import { CATEGORY_STYLES } from '../constants/styles';

// ============================================================
// 核心工具函数：纯文本 ↔ DOM 双向转换 & 光标偏移映射
// ============================================================

const PILL_ATTR = 'data-pill-var';
const PILL_REGEX = /(\{\{[^{}\n]+\}\})/g;

function domToText(element) {
  if (!element) return '';
  let text = '';
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.hasAttribute(PILL_ATTR)) {
        text += node.getAttribute(PILL_ATTR);
      } else if (node.tagName === 'BR') {
        text += '\n';
      } else {
        text += domToText(node);
      }
    }
  }
  return text;
}

function getTextOffset(element) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !element) return null;
  
  const range = sel.getRangeAt(0);
  if (!element.contains(range.startContainer) && element !== range.startContainer) return null;

  const calcOffset = (container, offset) => {
    let pos = 0;
    const walk = (node) => {
      if (node === container) {
        if (node.nodeType === Node.TEXT_NODE) {
          pos += offset;
          return true;
        }
        let childIdx = 0;
        for (const child of node.childNodes) {
          if (childIdx === offset) return true;
          if (walk(child)) return true;
          childIdx++;
        }
        return true;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        pos += node.textContent.length;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.hasAttribute(PILL_ATTR)) {
          pos += node.getAttribute(PILL_ATTR).length;
        } else if (node.tagName === 'BR') {
          pos += 1;
        } else {
          for (const child of node.childNodes) {
            if (walk(child)) return true;
          }
        }
      }
      return false;
    };
    walk(element);
    return pos;
  };

  return {
    start: calcOffset(range.startContainer, range.startOffset),
    end: calcOffset(range.endContainer, range.endOffset),
  };
}

function setTextOffset(element, start, end) {
  if (!element) return;
  if (end === undefined) end = start;

  const findPosition = (targetOffset) => {
    let pos = 0;
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const len = node.textContent.length;
        if (pos + len >= targetOffset) {
          return { node, offset: targetOffset - pos };
        }
        pos += len;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.hasAttribute(PILL_ATTR)) {
          const pillLen = node.getAttribute(PILL_ATTR).length;
          if (pos + pillLen >= targetOffset) {
            const parent = node.parentNode;
            const idx = Array.from(parent.childNodes).indexOf(node);
            if (targetOffset <= pos) {
              return { node: parent, offset: idx };
            }
            return { node: parent, offset: idx + 1 };
          }
          pos += pillLen;
        } else if (node.tagName === 'BR') {
          if (pos + 1 >= targetOffset) {
            const parent = node.parentNode;
            const idx = Array.from(parent.childNodes).indexOf(node);
            if (targetOffset <= pos) {
              return { node: parent, offset: idx };
            }
            return { node: parent, offset: idx + 1 };
          }
          pos += 1;
        } else {
          for (const child of node.childNodes) {
            const result = walk(child);
            if (result) return result;
          }
        }
      }
      return null;
    };
    return walk(element) || { node: element, offset: element.childNodes.length };
  };

  const startPos = findPosition(start);
  const endPos = start === end ? startPos : findPosition(end);

  const sel = window.getSelection();
  const range = document.createRange();
  range.setStart(startPos.node, startPos.offset);
  range.setEnd(endPos.node, endPos.offset);
  sel.removeAllRanges();
  sel.addRange(range);
}

// ============================================================
// 解析工具
// ============================================================

function parseVariableName(varName) {
  const match = varName.match(/^(.+?)(?:_(\d+))?$/);
  if (match) return { baseKey: match[1], groupId: match[2] || null };
  return { baseKey: varName, groupId: null };
}

function parseInlineSyntax(raw) {
  const colonIdx = raw.indexOf(':');
  if (colonIdx === -1) return { varPart: raw.trim(), inlineVal: null };
  return {
    varPart: raw.slice(0, colonIdx).trim(),
    inlineVal: raw.slice(colonIdx + 1).trim(),
  };
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 在纯文本中找到光标所在的 {{...}} 变量的范围
 * 返回 { start, end } 或 null（光标不在任何变量内）
 */
function findVariableAtCursor(text, cursorPos) {
  if (!text || cursorPos == null) return null;
  const regex = /\{\{[^{}\n]+\}\}/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = match.index + match[0].length;
    // 光标在 {{ 和 }} 之间（含边界）都算"在内部"
    if (cursorPos > matchStart && cursorPos < matchEnd) {
      return { start: matchStart, end: matchEnd };
    }
  }
  return null;
}

// ============================================================
// ContentEditable 核心编辑器
// ============================================================

const ContentEditableEditor = React.forwardRef(({
  value,
  onChange,
  banks,
  categories,
  isDarkMode,
  onInteraction,
  onFocus,
  onUndo,
  onRedo,
  className,
  style,
}, forwardedRef) => {
  const editableRef = useRef(null);
  const isComposingRef = useRef(false);
  const lastValueRef = useRef(value);
  const suppressSyncRef = useRef(false);
  // 当前正在编辑中的变量范围 { start, end }，该范围内不 pill 化
  const editingVarRef = useRef(null);

  const buildPillHTML = useCallback((fullMatch, rawInner, banks_, categories_, isDark) => {
    const { varPart } = parseInlineSyntax(rawInner);
    const parsed = parseVariableName(varPart);
    const baseKey = parsed.baseKey;
    const bank = banks_[baseKey] || banks_[varPart];
    const categoryId = bank?.category || 'other';
    const colorKey = categories_[categoryId]?.color || 'slate';
    const catStyle = CATEGORY_STYLES[colorKey];

    const displayText = rawInner;
    const escapedFullMatch = escapeAttr(fullMatch);

    const pillClasses = isDark
      ? `${catStyle.text} rounded-md px-1 py-[1px] mx-[1px] border border-white/[0.08]`
      : `${catStyle.bg} ${catStyle.text} rounded-md px-1 py-[1px] mx-[1px] border ${catStyle.border}`;

    const pillStyle = isDark
      ? `background:rgba(255,255,255,0.06);`
      : ``;

    const bracketStyle = isDark
      ? `opacity:0.3;` 
      : `opacity:0.35;`;

    return `<span ${PILL_ATTR}="${escapedFullMatch}" data-export-pill="true" contenteditable="false" class="${pillClasses}" style="${pillStyle}display:inline;white-space:nowrap;font-size:inherit;line-height:inherit;vertical-align:baseline;cursor:default;"><span style="${bracketStyle}">{{</span>${escapeHTML(displayText)}<span style="${bracketStyle}">}}</span></span>`;
  }, []);

  /**
   * 将纯文本渲染为 HTML，editingRange 范围内的 {{}} 保持纯文本不 pill 化
   */
  const textToHTML = useCallback((text, banks_, categories_, isDark, editingRange) => {
    if (!text) return '';
    
    const lines = text.split('\n');
    let charPos = 0;
    
    return lines.map((line, lineIdx) => {
      const lineStart = charPos;
      
      if (!line) {
        charPos += 1; // \n
        return lineIdx < lines.length - 1 ? '<br>' : '';
      }
      
      const parts = line.split(PILL_REGEX);
      let inLinePos = lineStart;
      
      const html = parts.map(part => {
        const partStart = inLinePos;
        const partEnd = inLinePos + part.length;
        inLinePos = partEnd;
        
        if (part.startsWith('{{') && part.endsWith('}}')) {
          // 光标在这个变量内？不 pill 化，保持纯文本
          if (editingRange && partStart === editingRange.start && partEnd === editingRange.end) {
            return escapeHTML(part);
          }
          const rawInner = part.slice(2, -2);
          return buildPillHTML(part, rawInner, banks_, categories_, isDark);
        }
        return escapeHTML(part);
      }).join('');
      
      charPos += line.length + (lineIdx < lines.length - 1 ? 1 : 0); // +1 for \n
      return html + (lineIdx < lines.length - 1 ? '<br>' : '');
    }).join('');
  }, [buildPillHTML]);

  /**
   * 检测光标位置，更新 editingVarRef，必要时重渲染 DOM
   */
  const syncEditingState = useCallback((text, cursorPos) => {
    const newRange = findVariableAtCursor(text, cursorPos);
    const oldRange = editingVarRef.current;
    
    const rangeChanged = 
      (newRange == null) !== (oldRange == null) ||
      (newRange && oldRange && (newRange.start !== oldRange.start || newRange.end !== oldRange.end));
    
    if (rangeChanged) {
      editingVarRef.current = newRange;
      // 重渲染 DOM 以更新哪些变量是 pill、哪些是纯文本
      if (editableRef.current) {
        const html = textToHTML(text, banks, categories, isDarkMode, newRange);
        editableRef.current.innerHTML = html || '<br>';
        // 恢复光标
        if (cursorPos != null) {
          try {
            setTextOffset(editableRef.current, cursorPos);
          } catch (_) { /* ignore */ }
        }
      }
    }
  }, [banks, categories, isDarkMode, textToHTML]);

  // 同步 DOM 内容（当 value prop 从外部变化时）
  useEffect(() => {
    if (!editableRef.current) return;
    if (isComposingRef.current) return;
    if (suppressSyncRef.current) {
      suppressSyncRef.current = false;
      return;
    }

    const currentText = domToText(editableRef.current);
    if (currentText === value) {
      lastValueRef.current = value;
      return;
    }

    const offsetInfo = getTextOffset(editableRef.current);
    const cursorPos = offsetInfo ? offsetInfo.start : null;
    
    // 外部变化时重置编辑态
    editingVarRef.current = null;
    
    const html = textToHTML(value, banks, categories, isDarkMode, null);
    editableRef.current.innerHTML = html || '<br>';
    lastValueRef.current = value;

    if (offsetInfo && document.activeElement === editableRef.current) {
      try {
        const clampedStart = Math.min(offsetInfo.start, (value || '').length);
        const clampedEnd = Math.min(offsetInfo.end, (value || '').length);
        setTextOffset(editableRef.current, clampedStart, clampedEnd);
      } catch (_) { /* ignore */ }
    }
  }, [value, banks, categories, isDarkMode, textToHTML]);

  const emitChange = useCallback((newText) => {
    lastValueRef.current = newText;
    suppressSyncRef.current = true;
    const syntheticEvent = { target: { value: newText } };
    onChange(syntheticEvent);
  }, [onChange]);

  // input 事件处理
  const handleInput = useCallback(() => {
    if (isComposingRef.current) return;
    if (!editableRef.current) return;

    const newText = domToText(editableRef.current);
    if (newText === lastValueRef.current) return;

    const offset = getTextOffset(editableRef.current);
    const cursorPos = offset ? offset.start : null;
    
    // 检测光标是否在某个 {{}} 内
    const cursorRange = findVariableAtCursor(newText, cursorPos);
    editingVarRef.current = cursorRange;

    // 重渲染 DOM：cursorRange 内的变量保持纯文本，其余 pill 化
    const html = textToHTML(newText, banks, categories, isDarkMode, cursorRange);
    editableRef.current.innerHTML = html || '<br>';
    
    if (offset) {
      try {
        setTextOffset(editableRef.current, offset.start, offset.end);
      } catch (_) { /* ignore */ }
    }

    emitChange(newText);
  }, [emitChange, banks, categories, isDarkMode, textToHTML]);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    handleInput();
  }, [handleInput]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  /**
   * 点击事件：检测光标是否移入/移出某个 {{}} 变量，更新编辑态
   */
  const handleClick = useCallback((e) => {
    if (onInteraction) onInteraction();
    
    // 点击 pill 时，先拆解该 pill 为纯文本再定位光标
    const pillNode = e.target.closest?.(`[${PILL_ATTR}]`);
    if (pillNode && editableRef.current?.contains(pillNode)) {
      e.preventDefault();
      const text = lastValueRef.current || '';
      // 计算该 pill 在纯文本中的偏移
      let pos = 0;
      const walk = (node) => {
        if (node === pillNode) return true;
        if (node.nodeType === Node.TEXT_NODE) {
          pos += node.textContent.length;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.hasAttribute(PILL_ATTR)) {
            pos += node.getAttribute(PILL_ATTR).length;
          } else if (node.tagName === 'BR') {
            pos += 1;
          } else {
            for (const child of node.childNodes) {
              if (walk(child)) return true;
            }
          }
        }
        return false;
      };
      walk(editableRef.current);
      
      const pillText = pillNode.getAttribute(PILL_ATTR);
      const varRange = { start: pos, end: pos + pillText.length };
      // 光标定位到 }} 之前
      const cursorTarget = pos + pillText.length - 2;
      
      editingVarRef.current = varRange;
      const html = textToHTML(text, banks, categories, isDarkMode, varRange);
      editableRef.current.innerHTML = html || '<br>';
      try {
        setTextOffset(editableRef.current, cursorTarget);
      } catch (_) { /* ignore */ }
      return;
    }
    
    // 普通点击：检测光标是否在纯文本区域的 {{}} 内
    requestAnimationFrame(() => {
      if (!editableRef.current) return;
      const text = domToText(editableRef.current);
      const off = getTextOffset(editableRef.current);
      if (!off) return;
      syncEditingState(text, off.start);
    });
  }, [onInteraction, banks, categories, isDarkMode, textToHTML, syncEditingState]);

  /**
   * 键盘方向键/Home/End 等光标移动后也需要检测编辑态
   */
  const handleKeyUp = useCallback((e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      if (!editableRef.current) return;
      const text = domToText(editableRef.current);
      const off = getTextOffset(editableRef.current);
      if (!off) return;
      syncEditingState(text, off.start);
    }
  }, [syncEditingState]);

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      editingVarRef.current = null;
      if (onUndo) onUndo();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      editingVarRef.current = null;
      if (onRedo) onRedo();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
      e.preventDefault();
      editingVarRef.current = null;
      if (onRedo) onRedo();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }
  }, [onUndo, onRedo]);

  const handleFocusEvent = useCallback(() => {
    if (onFocus) onFocus();
    if (onInteraction) onInteraction();
  }, [onFocus, onInteraction]);

  const handleBlur = useCallback(() => {
    // 失焦时清除编辑态，确保所有变量都 pill 化
    if (editingVarRef.current && editableRef.current) {
      editingVarRef.current = null;
      const text = domToText(editableRef.current);
      const html = textToHTML(text, banks, categories, isDarkMode, null);
      editableRef.current.innerHTML = html || '<br>';
      lastValueRef.current = text;
    }
  }, [banks, categories, isDarkMode, textToHTML]);

  useImperativeHandle(forwardedRef, () => ({
    get value() { return domToText(editableRef.current); },
    get selectionStart() {
      const off = getTextOffset(editableRef.current);
      return off ? off.start : 0;
    },
    get selectionEnd() {
      const off = getTextOffset(editableRef.current);
      return off ? off.end : 0;
    },
    setSelectionRange(start, end) {
      setTextOffset(editableRef.current, start, end);
    },
    focus() { editableRef.current?.focus(); },
    get scrollTop() { return editableRef.current?.scrollTop || 0; },
    set scrollTop(v) { if (editableRef.current) editableRef.current.scrollTop = v; },
    get scrollHeight() { return editableRef.current?.scrollHeight || 0; },
    addEventListener(...args) { editableRef.current?.addEventListener(...args); },
    removeEventListener(...args) { editableRef.current?.removeEventListener(...args); },
    get _el() { return editableRef.current; },
  }), []);

  return (
    <div
      ref={editableRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onFocus={handleFocusEvent}
      onBlur={handleBlur}
      onClick={handleClick}
      spellCheck={false}
      className={className}
      style={style}
      role="textbox"
      aria-multiline="true"
    />
  );
});

ContentEditableEditor.displayName = 'ContentEditableEditor';

// ============================================================
// VisualEditor 主组件（保持原有 props 接口不变）
// ============================================================

export const VisualEditor = React.forwardRef(({ 
  value, 
  onChange, 
  banks, 
  categories, 
  isDarkMode,
  activeTemplate,
  language,
  t,
  onInteraction,
  onUndo,
  onRedo,
}, ref) => {
  const containerRef = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const editorBaseClass = `w-full h-full font-mono text-sm leading-relaxed whitespace-pre-wrap break-words focus:outline-none m-0 transition-colors duration-300 selection:bg-orange-500/30 ${isDarkMode ? 'text-gray-300 caret-white selection:text-white' : 'text-gray-800 caret-gray-800 selection:bg-orange-200 selection:text-orange-900'}`;
  const editorStyle = { 
    fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  };

  if (isMobile) {
    const title = activeTemplate ? (typeof activeTemplate.name === 'object' ? (activeTemplate.name[language] || activeTemplate.name.cn || activeTemplate.name.en) : activeTemplate.name) : '';
    const author = activeTemplate ? activeTemplate.author : '';

    return (
      <div 
        ref={containerRef}
        onScroll={() => { if (onInteraction) onInteraction(); }}
        onClick={() => { if (onInteraction) onInteraction(); }}
        className={`w-full h-full overflow-y-auto overflow-x-hidden flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#2A2928]' : 'bg-[#FBF5EE]/80'}`}
      >
        {/* Mobile Header */}
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
        <div className="flex-1 px-6 pb-20">
          <ContentEditableEditor
            ref={ref}
            value={value}
            onChange={onChange}
            banks={banks}
            categories={categories}
            isDarkMode={isDarkMode}
            onInteraction={onInteraction}
            onUndo={onUndo}
            onRedo={onRedo}
            className={editorBaseClass}
            style={{ ...editorStyle, minHeight: '200px' }}
          />
        </div>
      </div>
    );
  }

  // 桌面端布局
  return (
    <div className="relative w-full h-full overflow-hidden transition-colors duration-300 bg-transparent">
      <ContentEditableEditor
        ref={ref}
        value={value}
        onChange={onChange}
        banks={banks}
        categories={categories}
        isDarkMode={isDarkMode}
        onInteraction={onInteraction}
        onUndo={onUndo}
        onRedo={onRedo}
        className={`${editorBaseClass} p-8 overflow-y-auto`}
        style={{ ...editorStyle, height: '100%' }}
      />
    </div>
  );
});

VisualEditor.displayName = 'VisualEditor';
