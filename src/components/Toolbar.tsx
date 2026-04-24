import { Copy, CheckCircle2, Download, Smartphone, Tablet, Monitor, Loader2, Link2, Unlink2, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ToolbarProps {
    previewDevice: 'mobile' | 'tablet' | 'pc';
    onDeviceChange: (device: 'mobile' | 'tablet' | 'pc') => void;
    onExportPdf: () => void;
    onExportHtml: () => void;
    onCopy: () => void;
    copied: boolean;
    isCopying: boolean;
    scrollSyncEnabled: boolean;
    onToggleScrollSync: () => void;
    convertPunctuation: boolean;
    onToggleConvertPunctuation: () => void;
}

export default function Toolbar({
    previewDevice,
    onDeviceChange,
    onExportPdf,
    onExportHtml,
    onCopy,
    copied,
    isCopying,
    scrollSyncEnabled,
    onToggleScrollSync,
    convertPunctuation,
    onToggleConvertPunctuation
}: ToolbarProps) {
    return (
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 max-w-[1024px]">
            <div className="hidden md:flex bg-[#00000006] dark:bg-[#ffffff08] p-1 rounded-full backdrop-blur-md">
                <button
                    data-testid="device-mobile"
                    onClick={() => onDeviceChange('mobile')}
                    className={`p-2 rounded-full transition-all ${previewDevice === 'mobile' ? 'bg-white dark:bg-[#2c2c2e] shadow-sm text-[#1d1d1f] dark:text-[#f5f5f7]' : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'}`}
                    title="手机视图 (480px)"
                >
                    <Smartphone size={16} />
                </button>
                <button
                    data-testid="device-tablet"
                    onClick={() => onDeviceChange('tablet')}
                    className={`p-2 rounded-full transition-all ${previewDevice === 'tablet' ? 'bg-white dark:bg-[#2c2c2e] shadow-sm text-[#1d1d1f] dark:text-[#f5f5f7]' : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'}`}
                    title="平板视图 (768px)"
                >
                    <Tablet size={16} />
                </button>
                <button
                    data-testid="device-pc"
                    onClick={() => onDeviceChange('pc')}
                    className={`p-2 rounded-full transition-all ${previewDevice === 'pc' ? 'bg-white dark:bg-[#2c2c2e] shadow-sm text-[#1d1d1f] dark:text-[#f5f5f7]' : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'}`}
                    title="桌面视图 (PC)"
                >
                    <Monitor size={16} />
                </button>
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-2.5">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    data-testid="punctuation-toggle"
                    onClick={onToggleConvertPunctuation}
                    className={`toolbar-toggle-option ${convertPunctuation ? 'toolbar-toggle-option-active' : ''}`}
                    title={convertPunctuation ? '关闭符号转中文与分割线清理' : '开启符号转中文与分割线清理'}
                >
                    <Wand2 size={15} className="shrink-0" />
                    <div className="min-w-0 text-left">
                        <div className="text-[13px] font-semibold leading-none">
                            <span className="hidden sm:inline">文本修整</span>
                            <span className="sm:hidden">修整</span>
                        </div>
                        <div className="mt-1 hidden text-[11px] leading-none text-[#6e6e73] dark:text-[#a1a1a6] md:block">
                            符号转中文
                        </div>
                    </div>
                    <span
                        aria-hidden="true"
                        className={`toolbar-switch toolbar-switch-compact ${convertPunctuation ? 'toolbar-switch-on' : ''}`}
                    >
                        <span className="toolbar-switch-knob" />
                    </span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    data-testid="scroll-sync-toggle"
                    onClick={onToggleScrollSync}
                    className={`toolbar-chip-btn ${scrollSyncEnabled ? 'toolbar-chip-btn-active' : ''}`}
                    title={scrollSyncEnabled ? '关闭滚动同步' : '开启滚动同步'}
                >
                    {scrollSyncEnabled ? <Link2 size={14} /> : <Unlink2 size={14} />}
                    <span className="hidden sm:inline">{scrollSyncEnabled ? '滚动同步' : '同步关闭'}</span>
                    <span className="sm:hidden">{scrollSyncEnabled ? '同步' : '关闭'}</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    data-testid="export-pdf"
                    onClick={onExportPdf}
                    className="toolbar-chip-btn !hidden sm:!inline-flex"
                >
                    <Download size={14} />
                    <span>PDF</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    data-testid="export-html"
                    onClick={onExportHtml}
                    className="toolbar-chip-btn !hidden lg:!inline-flex"
                >
                    <Download size={14} />
                    <span>HTML</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    data-testid="copy-button"
                    onClick={onCopy}
                    disabled={isCopying}
                    className={copied ? 'toolbar-copy-btn toolbar-copy-btn-success' : isCopying ? 'toolbar-copy-btn opacity-80 cursor-not-allowed' : 'toolbar-copy-btn'}
                >
                    {copied ? <CheckCircle2 size={16} /> : isCopying ? <Loader2 className="animate-spin" size={16} /> : <Copy size={16} />}
                    <span className="hidden sm:inline">{copied ? '已复制' : isCopying ? '打包中...' : '复制到公众号'}</span>
                    <span className="sm:hidden">{copied ? '已复制' : isCopying ? '打包中...' : '复制'}</span>
                </motion.button>
            </div>
        </div>
    );
}
