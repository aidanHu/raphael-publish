import type { AccountProfile } from './profiles';
import type { Theme } from './themes';

export interface DocumentMetrics {
    wordCount: number;
    readTimeMinutes: number;
}

interface ThemePalette {
    accent: string;
    background: string;
    border: string;
    muted: string;
    softSurface: string;
    strongSurface: string;
    text: string;
}

interface AlignmentStyles {
    textAlign: 'left' | 'center' | 'right';
    justifyContent: 'flex-start' | 'center' | 'flex-end';
}

function escapeHtml(text: string) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function extractStyle(styleStr: string, prop: string): string | null {
    const regex = new RegExp(`${prop}\\s*:\\s*([^;!]+)`, 'i');
    const match = styleStr.match(regex);
    return match ? match[1].trim() : null;
}

function parseRgbChannel(value: string) {
    const channel = Number.parseInt(value.trim(), 10);
    return Number.isNaN(channel) ? null : channel;
}

function isDarkColor(color: string) {
    const hexMatch = color.match(/^#([0-9a-f]{6})$/i);
    if (hexMatch) {
        const hex = hexMatch[1];
        const r = Number.parseInt(hex.slice(0, 2), 16);
        const g = Number.parseInt(hex.slice(2, 4), 16);
        const b = Number.parseInt(hex.slice(4, 6), 16);
        return ((r * 299) + (g * 587) + (b * 114)) / 1000 < 128;
    }

    const rgbMatch = color.match(/^rgb\(([^,]+),([^,]+),([^)]+)\)$/i);
    if (rgbMatch) {
        const r = parseRgbChannel(rgbMatch[1]);
        const g = parseRgbChannel(rgbMatch[2]);
        const b = parseRgbChannel(rgbMatch[3]);
        if (r === null || g === null || b === null) return false;
        return ((r * 299) + (g * 587) + (b * 114)) / 1000 < 128;
    }

    return false;
}

function getThemePalette(theme: Theme): ThemePalette {
    const text = extractStyle(theme.styles.p || '', 'color') || '#333333';
    const accent =
        extractStyle(theme.styles.a || '', 'color') ||
        extractStyle(theme.styles.h1 || '', 'color') ||
        extractStyle(theme.styles.blockquote || '', 'border-left')?.split(' ').pop() ||
        '#0066cc';
    const background = extractStyle(theme.styles.container || '', 'background-color') || '#ffffff';
    const muted = extractStyle(theme.styles.em || '', 'color') || '#6b7280';
    const isDark = isDarkColor(background);

    return {
        accent,
        background,
        border: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.10)',
        muted,
        softSurface: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)',
        strongSurface: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.88)',
        text
    };
}

function insertHtml(target: Element, position: InsertPosition, html: string) {
    target.insertAdjacentHTML(position, html);
}

function getAlignmentStyles(alignment: AccountProfile['headerAlignment']): AlignmentStyles {
    if (alignment === 'center') {
        return {
            textAlign: 'center',
            justifyContent: 'center'
        };
    }

    if (alignment === 'right') {
        return {
            textAlign: 'right',
            justifyContent: 'flex-end'
        };
    }

    return {
        textAlign: 'left',
        justifyContent: 'flex-start'
    };
}

function renderInlineAccentText(text: string, palette: ThemePalette) {
    const safeText = escapeHtml(text);
    return safeText.replace(/\*\*([^*]+)\*\*/g, `<strong style="color:${palette.accent}; font-weight:700;">$1</strong>`);
}

function renderIssueLabel(profile: AccountProfile, strongStyle: string) {
    const prefix = escapeHtml(profile.issuePrefix);
    const number = escapeHtml(profile.issueNumber);
    const suffix = escapeHtml(profile.issueSuffix);
    const issueText = `${profile.issuePrefix}${profile.issueNumber}${profile.issueSuffix}`.trim();

    if (!issueText) return '';

    return `${prefix}<span style="${strongStyle}">${number}</span>${suffix}`;
}

function renderMetaRows(profile: AccountProfile, metrics: DocumentMetrics, palette: ThemePalette, alignment: AlignmentStyles) {
    const metaStyle = `margin:0; line-height:1.7; color:${palette.muted}; font-size:13px; text-align:${alignment.textAlign};`;
    const strongStyle = `color:${palette.accent}; font-weight:700;`;
    const issueLabel = renderIssueLabel(profile, strongStyle);

    return [
        `<p style="${metaStyle}">文 | <span style="${strongStyle}">${escapeHtml(profile.authorName)}</span></p>`,
        `<p style="${metaStyle}">图片 | <span style="${strongStyle}">${escapeHtml(profile.imageSource)}</span></p>`,
        `<p style="${metaStyle}">字数 | <span style="${strongStyle}">${metrics.wordCount}</span> · 预计阅读 <span style="${strongStyle}">${metrics.readTimeMinutes}</span> 分钟</p>`,
        issueLabel ? `<p style="${metaStyle}">${issueLabel}</p>` : ''
    ].join('');
}

function renderHeader(theme: Theme, profile: AccountProfile, metrics: DocumentMetrics, palette: ThemePalette) {
    const alignment = getAlignmentStyles(profile.headerAlignment);
    const metaRows = renderMetaRows(profile, metrics, palette, alignment);
    const margin = theme.chrome === 'spotlight' || theme.chrome === 'card' ? '0 0 28px' : '0 0 24px';

    return `
        <section style="margin:${margin}; padding:0; text-align:${alignment.textAlign};">
            ${metaRows}
        </section>
    `;
}

function renderEndMarker(palette: ThemePalette, alignment: AlignmentStyles) {
    return `
        <p style="margin:40px 0 0; text-align:${alignment.textAlign}; font-size:12px; letter-spacing:0.14em; color:${palette.muted};">-- END --</p>
    `;
}

function renderAboutSection(theme: Theme, profile: AccountProfile, palette: ThemePalette) {
    const alignment = getAlignmentStyles(profile.footerAlignment);
    const aboutLines = profile.aboutLines.length > 0 ? profile.aboutLines : [''];
    const aboutHtml = aboutLines.map((line) => {
        if (!line.trim()) {
            return '<p style="margin:6px 0;">&nbsp;</p>';
        }
        return `<p style="margin:6px 0; line-height:1.8; color:${palette.text}; text-align:${alignment.textAlign};">${renderInlineAccentText(line, palette)}</p>`;
    }).join('');

    if (theme.chrome === 'card') {
        return `
            <section style="margin:18px 0 0; padding:0; text-align:${alignment.textAlign};">
                <p style="margin:0 0 12px; font-size:13px; font-weight:700; letter-spacing:0.08em; color:${palette.accent}; text-transform:uppercase;">${escapeHtml(profile.aboutTitle)}</p>
                ${aboutHtml}
            </section>
        `;
    }

    if (theme.chrome === 'editorial') {
        return `
            <section style="margin:18px 0 0; padding:0; text-align:${alignment.textAlign};">
                <p style="margin:0 0 12px; font-size:18px; line-height:1.3; color:${palette.accent}; font-weight:700;">${escapeHtml(profile.aboutTitle)}</p>
                ${aboutHtml}
            </section>
        `;
    }

    if (theme.chrome === 'spotlight') {
        return `
            <section style="margin:18px 0 0; padding:0; text-align:${alignment.textAlign};">
                <p style="margin:0 0 10px; font-size:16px; line-height:1.3; color:${palette.accent}; font-weight:700;">${escapeHtml(profile.aboutTitle)}</p>
                ${aboutHtml}
            </section>
        `;
    }

    return `
        <section style="margin:18px 0 0; padding:0; text-align:${alignment.textAlign};">
            <p style="margin:0 0 10px; font-size:14px; color:${palette.accent}; font-weight:700;">${escapeHtml(profile.aboutTitle)}</p>
            ${aboutHtml}
        </section>
    `;
}

export function getDocumentMetrics(text: string): DocumentMetrics {
    const strippedText = text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/!\[[^\]]*]\([^)]+\)/g, '')
        .replace(/\[[^\]]+]\([^)]+\)/g, '')
        .replace(/[>#*_~\-\r\n[\]()]/g, '')
        .replace(/[，。！？；：、,.!?;:"“”'‘’（）《》【】…—\s]/g, '');
    const wordCount = strippedText.length;

    return {
        wordCount,
        readTimeMinutes: Math.max(1, Math.ceil(wordCount / 400))
    };
}

export function composeDocumentHtml(contentHtml: string, theme: Theme, profile: AccountProfile, metrics: DocumentMetrics) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, 'text/html');
    const palette = getThemePalette(theme);
    const root = doc.body.firstElementChild instanceof HTMLElement
        ? doc.body.firstElementChild
        : doc.body.appendChild(doc.createElement('div'));

    if (!root.getAttribute('style')) {
        root.setAttribute('style', theme.styles.container);
    }

    if (profile.showAuthorInfo) {
        insertHtml(root, 'afterbegin', renderHeader(theme, profile, metrics, palette));
    }

    insertHtml(root, 'beforeend', renderEndMarker(palette, getAlignmentStyles(profile.footerAlignment)));

    if (profile.showAboutSection) {
        insertHtml(root, 'beforeend', renderAboutSection(theme, profile, palette));
    }

    return root.outerHTML;
}
