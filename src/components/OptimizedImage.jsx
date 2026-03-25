import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { loadImage } from '../utils/imageLoader';

/**
 * OptimizedImage - 优化的图片加载组件
 * 
 * 简化版本：直接使用原生 img + loading="lazy" + 队列限流
 * 避免复杂状态导致的显示问题
 */
const OptimizedImage = memo(({
  src,
  alt = '',
  className = '',
  style = {},
  priority = 10,
  rootMargin = '200px',
  onLoad,
  onError,
  referrerPolicy = 'no-referrer',
  isDarkMode = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const hasTriggeredLoad = useRef(false);
  const imgRef = useRef(null);

  // 使用 IntersectionObserver 触发队列加载（预热缓存）
  useEffect(() => {
    if (!src || hasTriggeredLoad.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasTriggeredLoad.current) {
          hasTriggeredLoad.current = true;
          // 通过队列预加载，限流
          loadImage(src, priority).catch(() => {});
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, priority, rootMargin]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.(new Error('Image load failed'));
  }, [onError]);

  // === 新增：拦截已知不可用的防盗链第三方图床 (例如 imgur.org) ===
  const isForbiddenHost = src && typeof src === 'string' && src.includes('imgur.org');

  if (hasError || isForbiddenHost) {
    return (
      <div 
        className={`${className} flex items-center justify-center`} 
        style={{ 
          ...style, 
          backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6',
          borderRadius: style.borderRadius || '8px',
          width: style.width || '100%',
          height: style.height || '100%',
          minHeight: style.height ? 'auto' : '150px'
        }}
        {...props}
      >
        <div className="flex flex-col items-center gap-1 opacity-60">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span style={{ fontSize: '11px' }} className="text-gray-400">暂无预览</span>
        </div>
      </div>
    );
  }
  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        ...style,
        backgroundColor: !isLoaded && !hasError 
          ? (isDarkMode ? '#374151' : '#e5e7eb') 
          : undefined,
      }}
      onLoad={handleLoad}
      onError={handleError}
      referrerPolicy={referrerPolicy}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export { OptimizedImage };
export default OptimizedImage;
