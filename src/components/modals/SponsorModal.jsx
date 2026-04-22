import React from 'react';
import { X } from 'lucide-react';

/**
 * 打赏弹窗组件
 * 显示微信和支付宝收款码，附上暖心文案
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - 是否打开弹窗
 * @param {Function} props.onClose - 关闭弹窗的回调
 * @param {boolean} props.isDarkMode - 是否暗色模式
 * @param {string} props.language - 当前语言
 */
const SponsorModal = ({ isOpen, onClose, isDarkMode, language }) => {
  if (!isOpen) return null;

  // 收款码图片路径（需要替换为实际的收款码图片）
  const wechatQRCode = "/images/wechat-qr-code.jpg";
  const alipayQRCode = "/images/alipay-qr-code.jpg";

  const content = {
    cn: {
      title: "请我喝杯奶茶",
      subtitle: "您的支持是我持续更新的动力",
      description: "如果这个工具对你有帮助，欢迎请我喝杯奶茶",
      wechat: "微信支付",
      alipay: "支付宝",
      thankYou: "感谢支持",
      note: "给多给少都是心意，一块两块不嫌少，一百二百不嫌多"
    },
    en: {
      title: "Buy me a bubble tea",
      subtitle: "Your support keeps me motivated",
      description: "If this tool helps you, consider buying me a bubble tea",
      wechat: "WeChat Pay",
      alipay: "Alipay",
      thankYou: "Thank you for your support",
      note: "Every bit counts, big or small - all appreciated"
    }
  };

  const t = content[language] || content.cn;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#242120] border-white/5' : 'bg-white border-gray-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 relative">
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className={`absolute top-6 right-6 p-2 rounded-full transition-all ${isDarkMode ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <X size={20} />
          </button>

          {/* 标题区域 */}
          <div className="text-center mb-6">
            <img
              src={`${import.meta.env.BASE_URL}images/LemonJuice.png`}
              alt="Lemon Juice"
              className="w-40 h-40 object-contain mx-auto mb-4 transition-transform duration-300 ease-in-out hover:scale-110 hover:rotate-6 cursor-pointer"
            />
            <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.title}
            </h3>
            <p className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {t.subtitle}
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.description}
            </p>
          </div>

          {/* 收款码区域 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* 微信支付 */}
            <div className={`rounded-2xl p-4 border-2 transition-all hover:scale-105 ${isDarkMode ? 'bg-[#1a1a18] border-white/10 hover:border-green-500/50' : 'bg-gray-50 border-gray-200 hover:border-green-500'}`}>
              <div className="aspect-square rounded-xl bg-white mb-3 flex items-center justify-center overflow-hidden">
                {/* 这里放置微信收款码图片 */}
                <div className={`text-center ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  <svg className="w-16 h-16 mx-auto mb-2 opacity-20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h18v18H3z"/>
                  </svg>
                  <p className="text-xs">{language === 'cn' ? '微信收款码' : 'WeChat QR'}</p>
                </div>
              </div>
              <p className={`text-sm font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t.wechat}
              </p>
            </div>

            {/* 支付宝 */}
            <div className={`rounded-2xl p-4 border-2 transition-all hover:scale-105 ${isDarkMode ? 'bg-[#1a1a18] border-white/10 hover:border-blue-500/50' : 'bg-gray-50 border-gray-200 hover:border-blue-500'}`}>
              <div className="aspect-square rounded-xl bg-white mb-3 flex items-center justify-center overflow-hidden">
                {/* 这里放置支付宝收款码图片 */}
                <div className={`text-center ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  <svg className="w-16 h-16 mx-auto mb-2 opacity-20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h18v18H3z"/>
                  </svg>
                  <p className="text-xs">{language === 'cn' ? '支付宝收款码' : 'Alipay QR'}</p>
                </div>
              </div>
              <p className={`text-sm font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t.alipay}
              </p>
            </div>
          </div>

          {/* 提示信息 */}
          <div className={`text-center p-4 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-orange-50'}`}>
            <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              {t.note}
            </p>
            <p className={`text-sm font-black mt-2 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent`}>
              {t.thankYou}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorModal;
