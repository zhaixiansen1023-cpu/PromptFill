import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const getTooltipPosition = (rect, position) => {
  const gap = 10;

  switch (position) {
    case 'left':
      return {
        left: rect.left - gap,
        top: rect.top + rect.height / 2,
        transform: 'translate(-100%, -50%)',
      };
    case 'top':
      return {
        left: rect.left + rect.width / 2,
        top: rect.top - gap,
        transform: 'translate(-50%, -100%)',
      };
    case 'bottom':
      return {
        left: rect.left + rect.width / 2,
        top: rect.bottom + gap,
        transform: 'translate(-50%, 0)',
      };
    case 'right':
    default:
      return {
        left: rect.right + gap,
        top: rect.top + rect.height / 2,
        transform: 'translate(0, -50%)',
      };
  }
};

/**
 * Tooltip 组件 - 提供圆角质感的简洁气泡提示
 */
export const Tooltip = ({ children, content, isDarkMode, position = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const triggerRef = useRef(null);

  const updatePosition = () => {
    if (!triggerRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    setCoordinates(getTooltipPosition(rect, position));
  };

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    updatePosition();

    const handleViewportChange = () => updatePosition();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isVisible, position]);

  const tooltipNode = isVisible && content && coordinates && typeof document !== 'undefined'
    ? createPortal(
        <div
          className={`
            fixed left-0 top-0 px-3 py-2 rounded-xl text-[11px] font-bold z-[4000]
            w-max max-w-[180px] min-w-[56px] whitespace-normal leading-relaxed text-center
            pointer-events-none animate-in fade-in zoom-in-95 duration-200
            ${isDarkMode
              ? 'bg-[#2A2928] text-gray-200 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
              : 'bg-white text-gray-700 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.1)]'}
          `}
          style={{
            left: `${coordinates.left}px`,
            top: `${coordinates.top}px`,
            transform: coordinates.transform,
            backgroundImage: isDarkMode
              ? 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {content}
        </div>,
        document.body,
      )
    : null;

  return (
    <div 
      ref={triggerRef}
      className="relative flex items-center justify-center"
      onMouseEnter={() => {
        updatePosition();
        setIsVisible(true);
      }}
      onMouseLeave={() => setIsVisible(false)}
      onFocusCapture={() => {
        updatePosition();
        setIsVisible(true);
      }}
      onBlurCapture={() => setIsVisible(false)}
    >
      {children}
      {tooltipNode}
    </div>
  );
};
