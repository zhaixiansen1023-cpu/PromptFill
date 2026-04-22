/**
 * 平台检测与跨平台工具
 * 统一管理 Web / Tauri iOS / Tauri Desktop 的环境差异
 */

// ========== 平台检测 ==========

/** 是否运行在 Tauri 环境中 */
export const isTauri = () =>
  !!(window.__TAURI_INTERNALS__ || window.__TAURI_IPC__ || window.location?.protocol === 'tauri:');

/** 是否为 iOS 系统 */
export const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

/** 是否为 Android 系统 */
export const isAndroid = () => /Android/i.test(navigator.userAgent);

/** 是否为 Tauri iOS App */
export const isTauriIOS = () => isTauri() && isIOS();

/** 是否为 Tauri Android App */
export const isTauriAndroid = () => isTauri() && isAndroid();

/** 是否为移动设备（屏幕宽度） */
export const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;


// ========== 跨平台网络请求 ==========

/**
 * 跨平台 fetch 封装
 * - Tauri 环境：使用 @tauri-apps/plugin-http（绕过 WKWebView 的 CORS / ATS 限制）
 * - 普通浏览器：使用原生 fetch
 *
 * @param {string} url - 请求地址
 * @param {RequestInit} [options] - fetch 选项
 * @returns {Promise<Response>}
 */
export const smartFetch = async (url, options = {}) => {
  // Tauri iOS: tauri-plugin-http ≥2.5.0 存在 response body 读取挂起的已知 Bug,
  // 而 Info.ios.plist 已开启 NSAllowsArbitraryLoads，原生 fetch 可直接访问 HTTPS。
  // 因此 iOS 端跳过插件，直接走 WKWebView 原生 fetch。
  if (isTauri() && !isIOS()) {
    try {
      const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
      return await tauriFetch(url, { ...options, method: options.method || 'GET' });
    } catch (e) {
      console.warn('[platform] Tauri fetch 失败，回退到原生 fetch:', e.message);
    }
  }
  return await fetch(url, options);
};


// ========== 外部链接 ==========

/**
 * 在系统浏览器中打开外部链接
 * - Tauri 环境：使用 @tauri-apps/plugin-opener 的 openUrl
 * - 普通浏览器：使用 window.open
 *
 * @param {string} url - 要打开的链接
 */
export const openExternalLink = async (url) => {
  if (!url) return;

  if (isTauri()) {
    try {
      // 改为直接引入，确保 Vite 能正确识别并打包插件
      const { openUrl } = await import('@tauri-apps/plugin-opener');
      await openUrl(url);
      return;
    } catch (err) {
      console.warn('[platform] openUrl failed, falling back to window.open:', err);
    }
  }

  window.open(url, '_blank', 'noopener,noreferrer');
};
