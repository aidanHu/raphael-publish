import { Copy, CheckCircle2, Download, Smartphone, Tablet, Monitor, Loader2, Link2, Unlink2 } from 'lucide-react';
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
    useCornerQuotes: boolean;
    onToggleCornerQuotes: () => void;
    normalizeEllipsisDashes: boolean;
    onToggleNormalizeEllipsisDashes: () => void;
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
    onToggleConvertPunctuation,
    useCornerQuotes,
    onToggleCornerQuotes,
    normalizeEllipsisDashes,
    onToggleNormalizeEllipsisDashes
}: ToolbarProps) {
    return (
        <div className="px-4 sm:px-6 py-2.5 md:px-6 md:py-3">
            <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-end gap-3 md:justify-between">
                    <DeviceSelector previewDevice={previewDevice} onDeviceChange={onDeviceChange} />
                    <div className="flex items-center justify-end gap-2 sm:gap-2.5">
                        <ExportActions
                            copied={copied}
                            isCopying={isCopying}
                            onCopy={onCopy}
                            onExportHtml={onExportHtml}
                            onExportPdf={onExportPdf}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 md:justify-end">
                    <ToggleOption
                        testId="punctuation-toggle"
                        badge="A→中"
                        label="符号转中文"
                        active={convertPunctuation}
                        onClick={onToggleConvertPunctuation}
                        title={convertPunctuation ? '关闭符号转中文与分割线清理' : '开启符号转中文与分割线清理'}
                    />
                    <ToggleOption
                        testId="corner-quotes-toggle"
                        badge="「」"
                        label="直角引号"
                        active={useCornerQuotes}
                        onClick={onToggleCornerQuotes}
                        title={useCornerQuotes ? '关闭直角引号' : '开启直角引号'}
                    />
                    <ToggleOption
                        testId="ellipsis-dash-toggle"
                        badge="……"
                        label="省略号/破折号"
                        active={normalizeEllipsisDashes}
                        onClick={onToggleNormalizeEllipsisDashes}
                        title={normalizeEllipsisDashes ? '关闭省略号和破折号规范化' : '开启省略号和破折号规范化'}
                    />
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        data-testid="scroll-sync-toggle"
                        onClick={onToggleScrollSync}
                        className={`toolbar-chip-btn ${scrollSyncEnabled ? 'toolbar-chip-btn-active' : ''}`}
                        title={scrollSyncEnabled ? '关闭滚动同步' : '开启滚动同步'}
                    >
                        {scrollSyncEnabled ? <Link2 size={14} /> : <Unlink2 size={14} />}
                        <span>滚动同步</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

interface DeviceSelectorProps {
    previewDevice: 'mobile' | 'tablet' | 'pc';
    onDeviceChange: (device: 'mobile' | 'tablet' | 'pc') => void;
}

function DeviceSelector({ previewDevice, onDeviceChange }: DeviceSelectorProps) {
    return (
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
    );
}

interface ExportActionsProps {
    copied: boolean;
    isCopying: boolean;
    onCopy: () => void;
    onExportHtml: () => void;
    onExportPdf: () => void;
}

function ExportActions({ copied, isCopying, onCopy, onExportHtml, onExportPdf }: ExportActionsProps) {
    return (
        <>
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
        </>
    );
}

interface ToggleOptionProps {
    active: boolean;
    badge: string;
    disabled?: boolean;
    label: string;
    onClick: () => void;
    testId: string;
    title: string;
}

function ToggleOption({ active, badge, disabled = false, label, onClick, testId, title }: ToggleOptionProps) {
    return (
        <motion.button
            whileHover={disabled ? undefined : { scale: 1.02 }}
            whileTap={disabled ? undefined : { scale: 0.97 }}
            data-testid={testId}
            disabled={disabled}
            onClick={onClick}
            className={`toolbar-chip-btn ${active ? 'toolbar-chip-btn-active' : ''} ${disabled ? 'toolbar-chip-btn-disabled' : ''}`}
            title={title}
        >
            <span className={`toolbar-chip-badge ${active ? 'toolbar-chip-badge-active' : ''}`}>{badge}</span>
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{badge === 'A→中' ? '符号' : badge === '「」' ? '引号' : '省略号'}</span>
        </motion.button>
    );
}
