import React, { useState } from 'react';

// ─── 状态配置 ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  empty:   { label: '无内容', color: '#6B7280', glow: false,  spin: false, blink: false },
  focused: { label: 'Focus',  color: '#4ADE80', glow: true,   spin: true,  blink: false },
  editing: { label: '修改中', color: '#FB923C', glow: false,  spin: true,  blink: true  },
  saved:   { label: '已保存', color: '#22C55E', glow: false,  spin: false, blink: false },
};

// ─── CSS 动画注入 ─────────────────────────────────────────────────────────────
const STYLE_TAG_ID = 'ui-test-styles';
if (!document.getElementById(STYLE_TAG_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_TAG_ID;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap');

    @font-face {
      font-family: 'VonwaonBitmap 12px';
      src: url('/VonwaonBitmap-16px.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'VonwaonBitmap';
      src: url('/VonwaonBitmap-16px.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }

    @keyframes cassette-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes indicator-blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.2; }
    }
    .cassette-item-wrap {
      transition: transform 0.2s ease;
    }
    .cassette-item-wrap:hover {
      transform: translateY(-2px);
    }
  `;
  document.head.appendChild(style);
}

// ─── 单个录像带 ───────────────────────────────────────────────────────────────
function CassetteTapeItem({ clipName, shotIndex, status, isSelected, onClick }) {
  const cfg = STATUS_CONFIG[status];
  const displayName = clipName.length > 6 ? clipName.slice(0, 5) + '…' : clipName;

  return (
    <div
      className="cassette-item-wrap"
      onClick={onClick}
      style={{
        width: 72,
        flexShrink: 0,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '6px 4px',
        borderRadius: 10,
        background: isSelected ? 'rgba(251,146,60,0.10)' : 'transparent',
        border: isSelected
          ? '1px solid rgba(251,146,60,0.35)'
          : '1px solid transparent',
        userSelect: 'none',
      }}
    >
      {/* 外壳 */}
      <div style={{
        width: 60,
        height: 140,
        borderRadius: 7,
        background: 'linear-gradient(175deg, #2c2c2c 0%, #1a1a1a 100%)',
        border: `1.5px solid ${isSelected ? 'rgba(251,146,60,0.3)' : '#383838'}`,
        boxShadow: isSelected
          ? '0 0 0 2px rgba(251,146,60,0.15), 0 6px 20px rgba(0,0,0,0.5)'
          : '0 4px 12px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '7px 5px 6px',
        gap: 5,
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}>
        {/* 标签纸 */}
        <div style={{
          width: '100%',
          flex: 1,
          borderRadius: 4,
          background: 'linear-gradient(160deg, #d4a574 0%, #b87d4a 100%)',
          border: '1px solid #a06830',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.15)',
        }}>
          {/* 序号色块 */}
          <div style={{
            width: '100%',
            background: 'linear-gradient(180deg, #e07840, #c86030)',
            padding: '2px 0',
            textAlign: 'center',
            borderBottom: '1px solid rgba(0,0,0,0.2)',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: 'monospace',
              fontSize: 12,
              fontWeight: 'bold',
              color: '#fff',
              letterSpacing: 1,
            }}>
              {String(shotIndex).padStart(2, '0')}
            </span>
          </div>
          {/* 竖线 */}
          <div style={{ width: '55%', height: 1, background: 'rgba(0,0,0,0.12)', margin: '2px 0', flexShrink: 0 }} />
          {/* 名称竖排 */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1px 3px' }}>
            <span style={{
              writingMode: 'vertical-rl',
              fontFamily: "'Caveat', cursive",
              fontSize: 12,
              color: '#5a3a1a',
              letterSpacing: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              maxHeight: 64,
            }}>
              {displayName}
            </span>
          </div>
        </div>

        {/* 光盘 */}
        <div style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #555, #1a1a1a)',
          border: '2px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: cfg.spin ? 'cassette-spin 2.4s linear infinite' : 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
          flexShrink: 0,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#0a0a0a', border: '1px solid #444' }} />
        </div>

        {/* 指示灯 */}
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: cfg.color,
          boxShadow: cfg.glow ? `0 0 7px ${cfg.color}, 0 0 14px ${cfg.color}` : 'none',
          animation: cfg.blink ? 'indicator-blink 0.9s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }} />
      </div>

      {/* 状态标签 */}
      <span style={{ fontSize: 9, color: cfg.color, opacity: 0.7, fontFamily: 'monospace' }}>
        {cfg.label}
      </span>
    </div>
  );
}

// ─── 内容面板（录像带右侧展开区） ─────────────────────────────────────────────
function CassetteContentPanel({ item, isDarkMode }) {
  if (!item) return null;
  const cfg = STATUS_CONFIG[item.status];

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '12px 16px',
      minWidth: 0,
    }}>
      {/* 面板标题栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingBottom: 10,
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: cfg.color,
            boxShadow: cfg.glow ? `0 0 6px ${cfg.color}` : 'none',
          }} />
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 160,
          }}>
            {item.clipName}
          </span>
          <span style={{
            fontSize: 10,
            fontFamily: 'monospace',
            color: isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
          }}>
            #{String(item.shotIndex).padStart(2, '0')}
          </span>
        </div>
        <span style={{
          fontSize: 10,
          padding: '2px 8px',
          borderRadius: 10,
          background: `${cfg.color}20`,
          border: `1px solid ${cfg.color}40`,
          color: cfg.color,
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
        }}>
          {cfg.label}
        </span>
      </div>

      {/* 内容区（可滚动） */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {item.status === 'empty' ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span style={{ fontSize: 12, fontFamily: 'monospace' }}>添加镜头内容</span>
          </div>
        ) : (
          /* 占位内容行（后续替换为真实镜头字段） */
          ['镜头类型', '画面描述', '对白', 'BGM'].map((field, i) => (
            <div key={i} style={{
              padding: '8px 10px',
              borderRadius: 6,
              background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            }}>
              <div style={{
                fontSize: 10,
                fontFamily: 'monospace',
                color: isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                {field}
              </div>
              <div style={{
                fontSize: 12,
                color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                fontFamily: 'monospace',
              }}>
                {i === 0 ? '特写 (CU)' : i === 1 ? '角色转身，光线打在侧脸…' : i === 2 ? '——' : 'Lo-fi Chill'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── 主录像带区域（内联插入展开布局） ───────────────────────────────────────
function CassetteRack({ isDarkMode }) {
  const [selectedId, setSelectedId] = useState(null);
  const [items, setItems] = useState([
    { id: 1, clipName: '雨夜追车',   shotIndex: 1, status: 'saved'   },
    { id: 2, clipName: '咖啡馆邂逅', shotIndex: 2, status: 'editing' },
    { id: 3, clipName: 'Scene03',    shotIndex: 3, status: 'empty'   },
    { id: 4, clipName: '结局',       shotIndex: 4, status: 'empty'   },
  ]);

  const handleSelect = (id) => {
    const next = selectedId === id ? null : id;
    setSelectedId(next);
    if (next !== null) {
      setItems(prev => prev.map(item => ({
        ...item,
        status: item.id === next
          ? 'focused'
          : (item.status === 'focused' ? 'saved' : item.status),
      })));
    }
  };

  const RACK_H = 200;
  const PANEL_W = 300;

  return (
    <div style={{
      width: '100%',
      height: RACK_H,
      borderRadius: 12,
      background: isDarkMode ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.04)',
      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      overflowX: 'auto',
      overflowY: 'hidden',
      padding: '0 8px',
      gap: 0,
    }}>
      {/* 每个录像带 + 紧跟其后的内联内容面板 */}
      {items.map(item => (
        <React.Fragment key={item.id}>
          <CassetteTapeItem
            clipName={item.clipName}
            shotIndex={item.shotIndex}
            status={item.status}
            isSelected={selectedId === item.id}
            onClick={() => handleSelect(item.id)}
          />

          {/* 内联内容面板：紧跟在该录像带右侧，width 动画展开 */}
          <div style={{
            width: selectedId === item.id ? PANEL_W : 0,
            height: '88%',
            flexShrink: 0,
            overflow: 'hidden',
            borderRadius: selectedId === item.id ? 8 : 0,
            background: selectedId === item.id
              ? (isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)')
              : 'transparent',
            border: selectedId === item.id
              ? `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
              : '1px solid transparent',
            marginLeft: selectedId === item.id ? 4 : 0,
            marginRight: selectedId === item.id ? 4 : 0,
            transition: 'width 0.32s cubic-bezier(0.4,0,0.2,1), margin 0.32s ease, border-color 0.2s ease',
          }}>
            {/* 只在选中时渲染内容，避免折叠状态下文字溢出 */}
            {selectedId === item.id && (
              <CassetteContentPanel item={item} isDarkMode={isDarkMode} />
            )}
          </div>
        </React.Fragment>
      ))}

      {/* 新增按钮 */}
      <div
        onClick={() => {
          const newId = Date.now();
          setItems(prev => [...prev, {
            id: newId,
            clipName: `Clip${prev.length + 1}`,
            shotIndex: prev.length + 1,
            status: 'empty',
          }]);
        }}
        style={{
          width: 60,
          height: 140,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          borderRadius: 7,
          border: `2px dashed ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          cursor: 'pointer',
          color: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.18)',
          marginLeft: 4,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span style={{ fontSize: 9, fontFamily: 'monospace' }}>NEW</span>
      </div>
    </div>
  );
}

// ─── 整体布局测试（模拟中央面板） ────────────────────────────────────────────
function CenterPanelMock({ isDarkMode }) {
  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Toolbar 占位 */}
      <div style={{
        height: 44,
        background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 8,
      }}>
        {[80, 60, 60, 40].map((w, i) => (
          <div key={i} style={{
            width: w,
            height: 24,
            borderRadius: 6,
            background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          }} />
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'monospace', color: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }}>
          Toolbar 占位
        </span>
      </div>

      {/* Editor 占位 */}
      <div style={{
        height: 200,
        background: isDarkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: 12, fontFamily: 'monospace', color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          ShotEditor 占位
        </span>
      </div>

      {/* Timeline 占位 */}
      <div style={{
        height: 56,
        background: isDarkMode
          ? 'repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 60px)'
          : 'repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 60px)',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 3,
      }}>
        {[3,5,4,2,3,2].map((w, i) => (
          <div key={i} style={{
            height: 28,
            flex: w,
            borderRadius: 4,
            background: i === 1
              ? (isDarkMode ? 'rgba(251,146,60,0.25)' : 'rgba(234,88,12,0.15)')
              : (isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'),
            border: i === 1 ? '1px solid rgba(251,146,60,0.4)' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`,
            fontSize: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace',
            color: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          }}>
            S{i + 1}
          </div>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'monospace', color: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }}>
          Timeline
        </span>
      </div>

      {/* 录像带区域 */}
      <CassetteRack isDarkMode={isDarkMode} />
    </div>
  );
}

// ─── 单体状态预览 ─────────────────────────────────────────────────────────────
function StatusPreviewPanel({ isDarkMode }) {
  const [demoName, setDemoName] = useState('雨夜追车');
  const [activeStatus, setActiveStatus] = useState('focused');

  return (
    <div style={{
      padding: 20,
      borderRadius: 12,
      background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
    }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* 四种状态并排 */}
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.keys(STATUS_CONFIG).map(s => (
            <CassetteTapeItem
              key={s}
              clipName={demoName}
              shotIndex={1}
              status={s}
              isSelected={activeStatus === s}
              onClick={() => setActiveStatus(s)}
            />
          ))}
        </div>

        {/* 控制 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 160 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontFamily: 'monospace', color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', marginBottom: 4 }}>
              CLIP NAME
            </label>
            <input
              value={demoName}
              onChange={e => setDemoName(e.target.value)}
              maxLength={10}
              style={{
                width: '100%',
                padding: '5px 8px',
                borderRadius: 5,
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                color: isDarkMode ? '#fff' : '#000',
                fontSize: 12,
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setActiveStatus(key)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 5,
                  border: `1px solid ${activeStatus === key ? cfg.color : 'transparent'}`,
                  background: activeStatus === key ? `${cfg.color}20` : (isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                  color: activeStatus === key ? cfg.color : (isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'),
                  fontSize: 10,
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                {key} · {cfg.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SVG 沙盒 ─────────────────────────────────────────────────────────────────
function SVGSandbox({ isDarkMode }) {
  return (
    <div style={{
      padding: 24,
      borderRadius: 12,
      background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      border: `1px dashed ${isDarkMode ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      <p style={{ margin: 0, fontSize: 11, fontFamily: 'monospace', color: isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)' }}>
        // SVG 分层对齐测试区（80×160px 容器）<br />
        // 替换各层 div 为真实 SVG，检查 position: absolute 锚点
      </p>
      <div style={{ position: 'relative', width: 72, height: 160, margin: '0 auto' }}>
        {/* 层0：外壳底 */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 7, background: 'linear-gradient(175deg,#2c2c2c,#1a1a1a)', border: '1.5px solid #383838' }} />
        {/* 层1：标签纸 */}
        <div style={{ position: 'absolute', top: '7%', left: '8%', width: '84%', height: '56%', borderRadius: 4, background: 'linear-gradient(160deg,#d4a574,#b87d4a)' }} />
        {/* 层2：序号 */}
        <div style={{ position: 'absolute', top: '7%', left: '8%', width: '84%', borderRadius: '4px 4px 0 0', background: 'linear-gradient(180deg,#e07840,#c86030)', textAlign: 'center', padding: '2px 0', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', color: '#fff' }}>01</div>
        {/* 层3：光盘 */}
        <div style={{ position: 'absolute', bottom: '16%', left: '50%', transform: 'translateX(-50%)', width: 30, height: 30, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%,#555,#1a1a1a)', border: '2px solid #333' }} />
        {/* 层4：指示灯 */}
        <div style={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', width: 9, height: 9, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 7px #4ADE80' }} />
      </div>
      <p style={{ margin: 0, fontSize: 10, fontFamily: 'monospace', color: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)', textAlign: 'center' }}>
        ↑ 72×160px · 将 SVG 文件放入 /public/assets/cassette/ 后替换各层
      </p>
    </div>
  );
}

// ─── Section 标题 ─────────────────────────────────────────────────────────────
function SectionTitle({ isDarkMode, index, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#FB923C', opacity: 0.6 }}>{index}</span>
      <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: isDarkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)', letterSpacing: 0.4 }}>{title}</h2>
      <div style={{ flex: 1, height: 1, background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
    </div>
  );
}

// ─── 电视控件 ─────────────────────────────────────────────────────────────────
//
// SVG 均为 900×720 同框，三层用 position:absolute inset:0 叠加
// tv-body：需横向拉伸 → <object> 方案使 preserveAspectRatio="none" 生效
// tv-logo：同框，Logo 路径在 y≈690 水平居中，整层叠加即可，不单独定位
// tv-spot：同框，灯在右下 (858,689)，整层叠加即可
//          灯色 #D68468 写死在 SVG，如需动态改色改用内联 SVG
//
// 标准坐标模式：
// 电视设计基准 = 900 × 720
// 文本框设计稿坐标 = x:50, y:55, w:800, h:540
const TV_BASE_W = 900;
const TV_BASE_H = 720;
const TV_TEXT_X = 50;
const TV_TEXT_Y = 55;
const TV_TEXT_WIDTH = 800;
const TV_TEXT_HEIGHT = 540;

// 占位文本内容
const DEMO_TEXT = `(00:00 - 00:04) Opening
  · Scene: Inside an ancient tavern, candlelight flickering
  · Characters: Describe the appearance and state of the characters here
  · Event: Describe the opening event here
  · Dialogue: (None / Fill in character lines here)
  · Shot: Epic Ultra Wide Aerial Shot
  · Camera Movement: Fast-cut montage (multi-angle quick cuts)

(00:04 - 00:08) Development
  · Scene: Transition from the previous scene, describe the scene changes here
  · Characters: Describe the characters' actions and expressions here
  · Event: Describe the key event advancing the plot here
  · Dialogue: (None / Fill in character lines here)
  · Shot: Wide Angle Tracking Shot with strong depth of field
  · Camera Movement: Fast-cut montage (multi-angle quick cuts)

(00:08 - 00:12) Climax
  · Scene: Describe the atmosphere of the climax scene here
  · Characters: Describe the characters' intense actions or emotional outbursts here
  · Event: Describe the most impactful core event here`;

function TVWidget({ mode = 'light', widthPercent = 78 }) {
  const isLight = mode === 'light';

  return (
    <div style={{
      width: `${widthPercent}%`,
      maxWidth: '100%',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
      aspectRatio: `${TV_BASE_W} / ${TV_BASE_H}`,
    }}>
      {/* ── z:0 电视体 SVG ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(/assets/tv/tv-body-${mode}.svg)`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '100% 100%',
        }}
      />

      {/* 关键修正：
          文本框不再靠“目测百分比”定位，而是直接使用设计稿坐标
          (50,55,800,540) 基于 900×720 换算成百分比。
          只要电视整体保持同一基准比例缩放，文本一定与屏幕对齐。 */}
      <div style={{
        position: 'absolute',
        top: `${(TV_TEXT_Y / TV_BASE_H) * 100}%`,
        left: `${(TV_TEXT_X / TV_BASE_W) * 100}%`,
        width: `${(TV_TEXT_WIDTH / TV_BASE_W) * 100}%`,
        height: `${(TV_TEXT_HEIGHT / TV_BASE_H) * 100}%`,
        zIndex: 1,
        overflow: 'hidden',
        mixBlendMode: 'multiply',
      }}>
        <div style={{
          fontFamily: "'VonwaonBitmap 12px', 'VonwaonBitmap', monospace",
          fontSize: 18,
          fontWeight: 'normal',
          lineHeight: '120%',
          letterSpacing: 0,
          color: '#272727',
          whiteSpace: 'pre-wrap',
          overflowY: 'auto',
          height: '100%',
          width: '100%',
          padding: '0',
          boxSizing: 'border-box',
        }}>
          {DEMO_TEXT}
        </div>
      </div>

      {/* ── z:2 Logo SVG（同框，电视体之上，文字之上） ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          backgroundImage: `url(/assets/tv/tv-logo-${mode}.svg)`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '100% 100%',
        }}
      />

      {/* ── z:2 Spot SVG（同框） ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          backgroundImage: `url(/assets/tv/tv-spot-${mode}.svg)`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '100% 100%',
        }}
      />
    </div>
  );
}

// ── 电视调试面板（Section 04 用） ─────────────────────────────────────────────
function TVDebugPanel({ isDarkMode }) {
  const [mode, setMode] = useState('light');
  const [widthPercent, setWidthPercent] = useState(78);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* 控制栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        padding: '10px 14px',
        borderRadius: 8,
        background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
      }}>
        {/* Dark / Light 切换 */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['light', 'dark'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '3px 12px', borderRadius: 5, cursor: 'pointer',
              border: `1px solid ${mode === m ? '#FB923C' : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
              background: mode === m ? 'rgba(251,146,60,0.15)' : 'transparent',
              color: mode === m ? '#FB923C' : (isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'),
              fontSize: 11, fontFamily: 'monospace', transition: 'all 0.15s',
            }}>
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>
            WIDTH
          </span>
          <input
            type="range" min={45} max={100} step={1} value={widthPercent}
            onChange={e => setWidthPercent(Number(e.target.value))}
            style={{ width: 100, accentColor: '#FB923C' }}
          />
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#FB923C', minWidth: 36 }}>
            {widthPercent}%
          </span>
        </div>

        {/* SVG 接入状态提示 */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          {[
            ['body',  false],
            ['logo',  false],
            ['spot',  false],
          ].map(([name, ready]) => (
            <span key={name} style={{
              fontSize: 9, fontFamily: 'monospace', padding: '2px 6px', borderRadius: 4,
              background: ready ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${ready ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: ready ? '#4ADE80' : (isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'),
            }}>
              {name} {ready ? '✓' : '·'}
            </span>
          ))}
        </div>
      </div>

      {/* 电视本体（外层给一个中性衬底，避免透明时露出页面背景色） */}
      <div style={{
        background: mode === 'light' ? '#e8e4da' : '#1a1a14',
        borderRadius: 20,
        padding: 0,
        overflow: 'hidden',
      }}>
        <TVWidget mode={mode} widthPercent={widthPercent} />
      </div>

      {/* 接入说明 */}
      <p style={{ margin: 0, fontSize: 10, fontFamily: 'monospace', color: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', lineHeight: 1.8 }}>
        // 标准坐标模式：TV = 900×720，TextBox = x50 / y55 / w800 / h540<br />
        // 当前 UI Test 只调电视整体宽度，内部元素按同一比例同步缩放
      </p>
    </div>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────
export default function UITestPage({ isDarkMode = true }) {
  const bg = isDarkMode ? '#141414' : '#f5f5f0';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)';

  return (
    <div style={{ minHeight: '100vh', background: bg, color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)', fontFamily: 'system-ui,sans-serif', padding: '28px 36px', overflowY: 'auto' }}>
      {/* 页头 */}
      <div style={{ marginBottom: 28, paddingBottom: 16, borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>🧪 UI Test Page</h1>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: textMuted }}>拟物化组件测试环境</p>
        </div>
        <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.25)', fontSize: 10, color: '#FB923C', fontFamily: 'monospace' }}>
          DEV ONLY
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <section>
          <SectionTitle isDarkMode={isDarkMode} index="01" title="录像带 · 单体状态预览" />
          <StatusPreviewPanel isDarkMode={isDarkMode} />
        </section>

        <section>
          <SectionTitle isDarkMode={isDarkMode} index="02" title="录像带 · 中央面板完整布局" />
          <CenterPanelMock isDarkMode={isDarkMode} />
        </section>

        <section>
          <SectionTitle isDarkMode={isDarkMode} index="03" title="录像带 · SVG 分层对齐沙盒（待接入）" />
          <SVGSandbox isDarkMode={isDarkMode} />
        </section>

        <section>
          <SectionTitle isDarkMode={isDarkMode} index="04" title="电视控件 · 实机调试（SVG 待接入）" />
          <TVDebugPanel isDarkMode={isDarkMode} />
        </section>
      </div>
    </div>
  );
}
