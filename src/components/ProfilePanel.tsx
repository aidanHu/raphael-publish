import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Plus, Save, Settings2, Trash2, UserRound, X } from 'lucide-react';
import type { AccountProfile } from '../lib/profiles';

interface ProfilePanelProps {
    profiles: AccountProfile[];
    activeProfileId: string;
    onProfileChange: (profileId: string) => void;
    onProfileCreate: () => void;
    onProfileDelete: () => void;
    onProfileUpdate: (profileId: string, updates: Partial<AccountProfile>) => void;
}

export default function ProfilePanel({
    profiles,
    activeProfileId,
    onProfileChange,
    onProfileCreate,
    onProfileDelete,
    onProfileUpdate
}: ProfilePanelProps) {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [showSavedState, setShowSavedState] = useState(false);
    const activeProfile = useMemo(
        () => profiles.find((profile) => profile.id === activeProfileId) || profiles[0],
        [profiles, activeProfileId]
    );

    useEffect(() => {
        if (!showSavedState) return;

        const timeoutId = window.setTimeout(() => {
            setShowSavedState(false);
        }, 1600);

        return () => window.clearTimeout(timeoutId);
    }, [showSavedState]);

    return (
        <>
            <button
                onClick={() => setIsEditorOpen(true)}
                title={`账户资料：${activeProfile.name}`}
                className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#00000010] bg-white/82 text-[#1d1d1f] shadow-[0_14px_30px_-24px_rgba(15,23,42,0.5)] transition-all hover:border-[#0066cc] hover:text-[#0066cc] dark:border-[#ffffff10] dark:bg-[#1c1c1e]/88 dark:text-[#f5f5f7] dark:hover:border-[#0a84ff] dark:hover:text-[#0a84ff]"
            >
                <UserRound size={18} />
                <span className="absolute -right-1 -top-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#0066cc] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white dark:bg-[#0a84ff]">
                    {profiles.length}
                </span>
            </button>

            <AnimatePresence>
                {isEditorOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] bg-[#0b1020]/28 backdrop-blur-[6px]"
                        onClick={() => setIsEditorOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, x: 36 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 24 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            onClick={(e) => e.stopPropagation()}
                            className="ml-auto flex h-screen w-full max-w-[620px] flex-col overflow-hidden border-l border-[#00000010] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,252,0.98))] shadow-[0_36px_90px_-36px_rgba(15,23,42,0.5)] dark:border-[#ffffff10] dark:bg-[linear-gradient(180deg,rgba(25,26,30,0.98),rgba(16,17,19,0.98))]"
                        >
                            <div className="shrink-0 border-b border-[#0000000d] px-5 py-4 dark:border-[#ffffff0d]">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,rgba(0,102,204,0.12),rgba(10,132,255,0.2))] text-[#0066cc] dark:text-[#7dc1ff]">
                                            <Settings2 size={19} />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0066cc] dark:text-[#7dc1ff]">Profile Editor</p>
                                            <h4 className="mt-1 truncate text-[22px] font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                                                编辑账户资料
                                            </h4>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsEditorOpen(false)}
                                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#00000010] bg-white text-[#6e6e73] transition-colors hover:text-[#1d1d1f] dark:border-[#ffffff10] dark:bg-[#1c1c1e] dark:text-[#9a9aa1] dark:hover:text-[#f5f5f7]"
                                        title="关闭"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="mt-4 grid gap-3">
                                    <label className="block">
                                        <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#86868b] dark:text-[#9a9aa1]">
                                            配置名称
                                        </span>
                                        <select
                                            value={activeProfile.id}
                                            onChange={(e) => onProfileChange(e.target.value)}
                                            className="w-full rounded-[18px] border border-[#00000010] bg-white px-4 py-3 text-[14px] font-medium text-[#1d1d1f] outline-none transition-colors focus:border-[#0066cc] dark:border-[#ffffff10] dark:bg-[#101113] dark:text-[#f5f5f7] dark:focus:border-[#0a84ff]"
                                        >
                                            {profiles.map((profile) => (
                                                <option key={profile.id} value={profile.id}>
                                                    {profile.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={onProfileCreate}
                                        className="inline-flex items-center gap-2 rounded-full border border-[#00000010] bg-white px-4 py-2.5 text-[13px] font-medium text-[#1d1d1f] shadow-sm transition-colors hover:border-[#0066cc] hover:text-[#0066cc] dark:border-[#ffffff10] dark:bg-[#101113] dark:text-[#f5f5f7] dark:hover:border-[#0a84ff] dark:hover:text-[#0a84ff]"
                                    >
                                        <Plus size={14} />
                                        新建
                                    </button>
                                    <button
                                        onClick={() => setShowSavedState(true)}
                                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-medium shadow-sm transition-colors ${
                                            showSavedState
                                                ? 'border-[#34c759] bg-[#34c759] text-white dark:border-[#32d74b] dark:bg-[#32d74b] dark:text-white'
                                                : 'border-[#00000010] bg-white text-[#1d1d1f] hover:border-[#0066cc] hover:text-[#0066cc] dark:border-[#ffffff10] dark:bg-[#101113] dark:text-[#f5f5f7] dark:hover:border-[#0a84ff] dark:hover:text-[#0a84ff]'
                                        }`}
                                    >
                                        {showSavedState ? <Check size={14} /> : <Save size={14} />}
                                        {showSavedState ? '已保存' : '保存'}
                                    </button>
                                    <button
                                        onClick={onProfileDelete}
                                        disabled={profiles.length <= 1}
                                        className="inline-flex items-center gap-2 rounded-full border border-[#00000010] bg-white px-4 py-2.5 text-[13px] font-medium text-[#7a2e2e] shadow-sm transition-colors hover:border-[#d11a2a] hover:text-[#d11a2a] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#ffffff10] dark:bg-[#101113] dark:text-[#ffb4b4] dark:hover:border-[#ff6b6b] dark:hover:text-[#ff6b6b]"
                                    >
                                        <Trash2 size={14} />
                                        删除
                                    </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
                                <div className="grid gap-5">
                                    <EditorSection title="基础资料" description="用于区分账号和渲染顶部元信息。">
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <Field
                                                label="账户名称（用于区分多个档案）"
                                                value={activeProfile.name}
                                                onChange={(value) => onProfileUpdate(activeProfile.id, { name: value })}
                                            />
                                            <Field
                                                label="作者名"
                                                value={activeProfile.authorName}
                                                onChange={(value) => onProfileUpdate(activeProfile.id, { authorName: value })}
                                            />
                                            <Field
                                                label="配图来源"
                                                value={activeProfile.imageSource}
                                                onChange={(value) => onProfileUpdate(activeProfile.id, { imageSource: value })}
                                            />
                                            <Field
                                                label="关于我标题"
                                                value={activeProfile.aboutTitle}
                                                onChange={(value) => onProfileUpdate(activeProfile.id, { aboutTitle: value })}
                                            />
                                        </div>
                                    </EditorSection>

                                    <EditorSection title="期数信息" description="用于顶部信息卡里的文章序号描述。">
                                        <div className="grid gap-3 md:grid-cols-3">
                                            <Field
                                                label="期数前缀"
                                                value={activeProfile.issuePrefix}
                                                onChange={(value) => onProfileUpdate(activeProfile.id, { issuePrefix: value })}
                                            />
                                            <Field
                                                label="期数"
                                                value={activeProfile.issueNumber}
                                                onChange={(value) => onProfileUpdate(activeProfile.id, { issueNumber: value })}
                                            />
                                            <Field
                                                label="期数后缀"
                                                value={activeProfile.issueSuffix}
                                                onChange={(value) => onProfileUpdate(activeProfile.id, { issueSuffix: value })}
                                            />
                                        </div>
                                    </EditorSection>

                                    <EditorSection title="布局偏好" description="账户内容不变，但可以控制头尾块的对齐方式和显隐。">
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <SelectField
                                                label="顶部信息对齐"
                                                value={activeProfile.headerAlignment}
                                                onChange={(value) => onProfileUpdate(activeProfile.id, { headerAlignment: value as AccountProfile['headerAlignment'] })}
                                                options={[
                                                    { value: 'left', label: '靠左' },
                                                    { value: 'center', label: '居中' },
                                                    { value: 'right', label: '靠右' }
                                                ]}
                                            />
                                            <SelectField
                                                label="底部信息对齐"
                                                value={activeProfile.footerAlignment}
                                                onChange={(value) => onProfileUpdate(activeProfile.id, { footerAlignment: value as AccountProfile['footerAlignment'] })}
                                                options={[
                                                    { value: 'left', label: '靠左' },
                                                    { value: 'center', label: '居中' },
                                                    { value: 'right', label: '靠右' }
                                                ]}
                                            />
                                        </div>

                                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                                            <ToggleRow
                                                label="显示顶部作者信息"
                                                checked={activeProfile.showAuthorInfo}
                                                onChange={(checked) => onProfileUpdate(activeProfile.id, { showAuthorInfo: checked })}
                                            />
                                            <ToggleRow
                                                label="显示底部关于我"
                                                checked={activeProfile.showAboutSection}
                                                onChange={(checked) => onProfileUpdate(activeProfile.id, { showAboutSection: checked })}
                                            />
                                        </div>
                                    </EditorSection>

                                    <EditorSection title="关于我内容" description="每行一段；如果需要主题强调色，可用 `**加粗**` 标记重点。">
                                        <label className="block">
                                            <textarea
                                                value={activeProfile.aboutLines.join('\n')}
                                                onChange={(e) => onProfileUpdate(activeProfile.id, { aboutLines: e.target.value.split('\n') })}
                                                rows={8}
                                                className="w-full min-h-[220px] resize-y rounded-[22px] border border-[#00000010] bg-white px-4 py-4 text-[14px] leading-7 text-[#1d1d1f] outline-none transition-colors focus:border-[#0066cc] dark:border-[#ffffff10] dark:bg-[#101113] dark:text-[#f5f5f7] dark:focus:border-[#0a84ff]"
                                                placeholder="每行一段，会渲染为尾部模块内容"
                                            />
                                        </label>
                                    </EditorSection>
                                </div>
                            </div>

                            <div className="shrink-0 flex items-center justify-end gap-3 border-t border-[#0000000d] px-5 py-4 dark:border-[#ffffff0d] bg-white/88 dark:bg-[#16171a]/88 backdrop-blur-md">
                                <button
                                    onClick={() => setIsEditorOpen(false)}
                                    className="inline-flex items-center justify-center rounded-full border border-[#00000010] bg-white px-5 py-2.5 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:border-[#0066cc] hover:text-[#0066cc] dark:border-[#ffffff10] dark:bg-[#101113] dark:text-[#f5f5f7] dark:hover:border-[#0a84ff] dark:hover:text-[#0a84ff]"
                                >
                                    关闭
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function EditorSection({
    title,
    description,
    children
}: {
    children: ReactNode;
    description: string;
    title: string;
}) {
    return (
        <section className="rounded-[26px] border border-[#0000000a] bg-[#f6f7fb] p-4 dark:border-[#ffffff10] dark:bg-[#16171a]">
            <div className="mb-4">
                <h5 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</h5>
                <p className="mt-1 text-[12px] leading-5 text-[#6e6e73] dark:text-[#9a9aa1]">{description}</p>
            </div>
            {children}
        </section>
    );
}

interface FieldProps {
    label: string;
    onChange: (value: string) => void;
    value: string;
}

function Field({ label, value, onChange }: FieldProps) {
    return (
        <label className="block">
            <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#86868b] dark:text-[#9a9aa1]">
                {label}
            </span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-[18px] border border-[#00000010] bg-white px-4 py-3 text-[14px] text-[#1d1d1f] outline-none transition-colors focus:border-[#0066cc] dark:border-[#ffffff10] dark:bg-[#101113] dark:text-[#f5f5f7] dark:focus:border-[#0a84ff]"
            />
        </label>
    );
}

interface SelectFieldProps {
    label: string;
    onChange: (value: string) => void;
    options: Array<{ label: string; value: string; }>;
    value: string;
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
    return (
        <label className="block">
            <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#86868b] dark:text-[#9a9aa1]">
                {label}
            </span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-[18px] border border-[#00000010] bg-white px-4 py-3 text-[14px] text-[#1d1d1f] outline-none transition-colors focus:border-[#0066cc] dark:border-[#ffffff10] dark:bg-[#101113] dark:text-[#f5f5f7] dark:focus:border-[#0a84ff]"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

interface ToggleRowProps {
    checked: boolean;
    label: string;
    onChange: (checked: boolean) => void;
}

function ToggleRow({ checked, label, onChange }: ToggleRowProps) {
    return (
        <label className="flex items-center justify-between rounded-[20px] border border-[#00000008] bg-white px-4 py-3 dark:border-[#ffffff10] dark:bg-[#101113]">
            <span className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{label}</span>
            <span className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${checked ? 'bg-[#0066cc] dark:bg-[#0a84ff]' : 'bg-[#d9d9df] dark:bg-[#3a3a3f]'}`}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="peer sr-only"
                />
                <span className={`absolute left-1 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
            </span>
        </label>
    );
}
