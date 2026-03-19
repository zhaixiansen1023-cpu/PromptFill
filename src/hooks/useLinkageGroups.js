import { useState, useCallback, useRef } from 'react';

/**
 * 从 content 文本扫描所有 {{key: val}} 内联值，返回更新后的 localOptions。
 * 内联值不在 bank 中 → 写入临时槽；在 bank 中 → 清空该 key 的临时槽。
 * 每个 baseKey 只保留最新出现的临时值（最后一次扫描结果覆盖）。
 *
 * @param {string} contentStr - 单语言的 content 字符串
 * @param {Object} currentLocalOptions - 模版当前的 localOptions
 * @param {Object} banks - 全局词库
 * @returns {Object} 新的 localOptions
 */
export const computeLocalOptionsFromContent = (contentStr, currentLocalOptions, banks) => {
  if (!contentStr || typeof contentStr !== 'string') return currentLocalOptions || {};
  const next = { ...(currentLocalOptions || {}) };
  const matches = [...contentStr.matchAll(/\{\{([^}]+)\}\}/g)];
  for (const m of matches) {
    const colonIdx = m[1].indexOf(':');
    if (colonIdx === -1) continue;
    const rawKey = m[1].slice(0, colonIdx).trim();
    const baseKeyMatch = rawKey.match(/^(.+?)(?:_\d+)?$/);
    const baseKey = baseKeyMatch ? baseKeyMatch[1] : rawKey;
    const inlineVal = m[1].slice(colonIdx + 1).trim();
    if (!inlineVal) continue;

    const bankOptions = banks[baseKey]?.options || [];
    const isInBank = bankOptions.some(opt => {
      const s = typeof opt === 'string' ? opt : (opt?.cn || opt?.en || '');
      return s === inlineVal;
    });

    if (isInBank) {
      delete next[baseKey];
    } else {
      next[baseKey] = inlineVal;
    }
  }
  return next;
};

/**
 * 变量名解析工具函数
 * 从变量名中提取 baseKey 和 groupId
 * 例如: "fruit_1" -> { baseKey: "fruit", groupId: "1" }
 *       "fruit" -> { baseKey: "fruit", groupId: null }
 *
 * @param {string} varName - 变量名
 * @returns {Object} { baseKey, groupId }
 */
export const parseVariableName = (varName) => {
  const match = varName.match(/^(.+?)(?:_(\d+))?$/);
  if (match) {
    return {
      baseKey: match[1],
      groupId: match[2] || null
    };
  }
  return { baseKey: varName, groupId: null };
};

/**
 * 联动组管理 Hook
 * 提供变量联动组的功能，支持相同 baseKey 和 groupId 的变量同步更新
 *
 * @param {string} activeTemplateId - 当前激活的模版 ID
 * @param {Array} templates - 所有模版
 * @param {Function} setTemplates - 更新模版的函数
 * @param {Object} banks - 词库对象
 * @param {Function} handleAddOption - 添加选项的函数
 * @returns {Object} 联动组相关的函数和状态
 */
export const useLinkageGroups = (
  activeTemplateId,
  templates,
  setTemplates,
  banks,
  handleAddOption
) => {
  // 光标在变量内的状态
  const [cursorInVariable, setCursorInVariable] = useState(false);
  const [currentVariableName, setCurrentVariableName] = useState(null);
  const [currentGroupId, setCurrentGroupId] = useState(null);

  /**
   * 查找模板中所有需要联动的变量
   * 规则：相同 baseKey 且相同 groupId 的变量联动
   *
   * @param {Object} template - 模版对象
   * @param {string} baseKey - 变量的基础键名
   * @param {string|null} groupId - 组 ID
   * @returns {Array} 联动变量的 uniqueKey 数组
   */
  const findLinkedVariables = useCallback((template, baseKey, groupId) => {
    if (!groupId) return []; // 没有 groupId 的变量不联动

    const linkedKeys = new Set();
    
    // 获取模版的所有内容（可能是对象或字符串）
    const contentData = template.content;
    const contents = typeof contentData === 'object' 
      ? Object.values(contentData) 
      : [contentData || ''];

    // 分别处理每段内容，以确保索引计算逻辑与渲染时保持一致
    contents.forEach(content => {
      if (!content) return;
      
      const allMatches = content.matchAll(/\{\{([^}]+)\}\}/g);
      const counters = {};

      for (const match of allMatches) {
        const fullKey = match[1].trim();
        const parsed = parseVariableName(fullKey);

        // 匹配相同 baseKey 且相同 groupId 的变量
        if (parsed.baseKey === baseKey && parsed.groupId === groupId) {
          const idx = counters[fullKey] || 0;
          counters[fullKey] = idx + 1;
          linkedKeys.add(`${fullKey}-${idx}`);
        }
      }
    });

    return Array.from(linkedKeys);
  }, []);

  /**
   * 更新模版的选择值，并同步更新所有联动的变量
   *
   * @param {string} uniqueKey - 变量的唯一键
   * @param {*} value - 要设置的值
   * @param {Array} linkedKeys - 需要联动的变量键数组
   */
  // 将 content 中指定变量位置的内联值替换为新值
  // uniqueKey 格式为 "varName-index"（如 "scene-0"、"scene-1"）
  // 支持旧格式 {{varName}} 和新格式 {{varName: oldVal}}，均替换为 {{varName: newValStr}}
  const updateContentInlineValue = useCallback((content, uniqueKey, value) => {
    if (!content || typeof content !== 'string') return content;

    // 从 uniqueKey 提取 varName 和出现序号
    const lastDashIdx = uniqueKey.lastIndexOf('-');
    if (lastDashIdx === -1) return content;
    const varName = uniqueKey.slice(0, lastDashIdx);
    const targetIndex = parseInt(uniqueKey.slice(lastDashIdx + 1), 10);
    if (isNaN(targetIndex)) return content;

    // 将 value（字符串或双语对象）转为显示字符串
    // 优先取当前语言，无法判断时取 cn 或 en
    const valStr = typeof value === 'string'
      ? value
      : (value?.cn || value?.en || String(value));

    // 正则匹配 {{varName}} 或 {{varName: 任意内容}}（varName 精确匹配，冒号前后允许空格）
    const pattern = new RegExp(`\\{\\{\\s*${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(?::[^}]*)?\\}\\}`, 'g');

    let occurrenceCount = 0;
    return content.replace(pattern, (match) => {
      if (occurrenceCount === targetIndex) {
        occurrenceCount++;
        return `{{${varName}: ${valStr}}}`;
      }
      occurrenceCount++;
      return match;
    });
  }, []);

  // 包装导出的纯函数，绑定当前 banks
  const computeLocalOptions = useCallback((contentStr, currentLocalOptions) => {
    return computeLocalOptionsFromContent(contentStr, currentLocalOptions, banks);
  }, [banks]);

  const updateActiveTemplateSelection = useCallback((uniqueKey, value, linkedKeys = []) => {
    setTemplates(prev => prev.map(t => {
      if (t.id === activeTemplateId) {
        const newSelections = { ...t.selections, [uniqueKey]: value };

        // 同步更新所有联动的变量
        linkedKeys.forEach(linkedKey => {
          if (linkedKey !== uniqueKey) {
            newSelections[linkedKey] = value;
          }
        });

        // 同步更新 content 中的内联值（支持双语 content 对象和字符串）
        let newContent = t.content;
        const keysToUpdate = [uniqueKey, ...linkedKeys.filter(k => k !== uniqueKey)];

        if (typeof newContent === 'object' && newContent !== null) {
          newContent = { ...newContent };
          Object.keys(newContent).forEach(lang => {
            keysToUpdate.forEach(k => {
              newContent[lang] = updateContentInlineValue(newContent[lang], k, value);
            });
          });
        } else if (typeof newContent === 'string') {
          keysToUpdate.forEach(k => {
            newContent = updateContentInlineValue(newContent, k, value);
          });
        }

        // 同步更新 localOptions 临时槽（取任意一语言的 content 扫描即可）
        const contentForScan = typeof newContent === 'object'
          ? (newContent.cn || newContent.en || '')
          : (newContent || '');
        const newLocalOptions = computeLocalOptions(contentForScan, t.localOptions);

        return {
          ...t,
          content: newContent,
          selections: newSelections,
          localOptions: newLocalOptions,
        };
      }
      return t;
    }));
  }, [activeTemplateId, setTemplates, updateContentInlineValue, computeLocalOptions]);

  /**
   * 处理变量选择
   * 自动处理联动组的同步更新
   *
   * @param {string} key - 变量键名
   * @param {number} index - 变量索引
   * @param {*} value - 选中的值
   * @param {Function} setActivePopover - 关闭弹出层的函数
   */
  const handleSelect = useCallback((key, index, value, setActivePopover) => {
    const uniqueKey = `${key}-${index}`;

    // 解析变量名，检查是否有联动组
    const parsed = parseVariableName(key);

    // 如果有关联组，找到所有需要联动的变量
    let linkedKeys = [];
    if (parsed.groupId) {
      const activeTemplate = templates.find(t => t.id === activeTemplateId);
      if (activeTemplate) {
        linkedKeys = findLinkedVariables(activeTemplate, parsed.baseKey, parsed.groupId);
      }
    }

    updateActiveTemplateSelection(uniqueKey, value, linkedKeys);
    if (setActivePopover) {
      setActivePopover(null);
    }
  }, [parseVariableName, findLinkedVariables, updateActiveTemplateSelection, templates, activeTemplateId]);

  /**
   * 添加自定义选项并选中
   * 同时会添加到词库中（如果不存在）
   *
   * @param {string} key - 变量键名
   * @param {number} index - 变量索引
   * @param {string} newValue - 新选项的值
   * @param {Function} setActivePopover - 关闭弹出层的函数
   */
  const handleAddCustomAndSelect = useCallback((key, index, newValue, setActivePopover) => {
    if (!newValue || !newValue.trim()) return;

    // 解析变量名，获取 baseKey（词库的 key）
    const parsed = parseVariableName(key);
    const baseKey = parsed.baseKey;

    // 1. Add to bank if not exists (使用 baseKey)
    if (banks[baseKey] && !banks[baseKey].options.includes(newValue)) {
      handleAddOption(baseKey, newValue);
    }

    // 2. Select it (使用完整的 key，可能包含 groupId)
    handleSelect(key, index, newValue, setActivePopover);
  }, [banks, handleSelect, handleAddOption]);

  return {
    parseVariableName,
    cursorInVariable,
    setCursorInVariable,
    currentVariableName,
    setCurrentVariableName,
    currentGroupId,
    setCurrentGroupId,
    findLinkedVariables,
    updateActiveTemplateSelection,
    handleSelect,
    handleAddCustomAndSelect,
  };
};
