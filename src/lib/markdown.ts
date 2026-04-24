import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { THEMES } from './themes';

export const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: false,
    highlight: function (str, lang) {
        let codeContent = '';
        if (lang && hljs.getLanguage(lang)) {
            try {
                codeContent = hljs.highlight(str, { language: lang }).value;
            } catch (__) {
                codeContent = md.utils.escapeHtml(str);
            }
        } else {
            codeContent = md.utils.escapeHtml(str);
        }

        const dots = '<div style="margin-bottom: 12px; white-space: nowrap;"><span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #ff5f56; margin-right: 6px;"></span><span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e; margin-right: 6px;"></span><span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #27c93f;"></span></div>';

        return `<pre>${dots}<code class="hljs">${codeContent}</code></pre>`;
    }
});

const PUNCTUATION_MAP: Record<string, string> = {
    ',': '，',
    '.': '。',
    ':': '：',
    ';': '；',
    '?': '？',
    '!': '！',
    '(': '（',
    ')': '）',
    '/': '／'
};

function isAsciiLetterOrDigit(char: string) {
    return /[A-Za-z0-9]/.test(char);
}

function isDigit(char: string) {
    return /\d/.test(char);
}

function isListMarkerPeriod(text: string, index: number) {
    if (text[index] !== '.' || !isDigit(text[index - 1] || '')) {
        return false;
    }

    let start = index - 1;
    while (start >= 0 && isDigit(text[start])) {
        start -= 1;
    }

    const before = text[start] || '';
    const after = text[index + 1] || '';

    return (!before || /\s/.test(before) || /[([{\n]/.test(before)) && (!after || /\s/.test(after) || /[\u4e00-\u9fff]/.test(after));
}

function shouldSkipPunctuationConversion(text: string, index: number, char: string) {
    const prev = text[index - 1] || '';
    const next = text[index + 1] || '';

    if ((char === '.' || char === ',' || char === ':') && isDigit(prev) && isDigit(next)) {
        return true;
    }

    if (char === '.' && isListMarkerPeriod(text, index)) {
        return true;
    }

    if (char === "'" && isAsciiLetterOrDigit(prev) && isAsciiLetterOrDigit(next)) {
        return true;
    }

    return false;
}

function convertQuoteMarks(text: string, style: 'curly' | 'corner') {
    let result = '';
    let doubleQuoteOpen = false;
    let singleQuoteOpen = false;

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];

        if (char === '"' || char === "'") {
            const prev = text[index - 1] || '';
            const next = text[index + 1] || '';

            if (char === "'" && isAsciiLetterOrDigit(prev) && isAsciiLetterOrDigit(next)) {
                result += "'";
                continue;
            }

            if (char === '"') {
                if (style === 'corner') {
                    result += doubleQuoteOpen ? '」' : '「';
                } else {
                    result += doubleQuoteOpen ? '”' : '“';
                }
                doubleQuoteOpen = !doubleQuoteOpen;
                continue;
            }

            if (style === 'corner') {
                result += singleQuoteOpen ? '』' : '『';
            } else {
                result += singleQuoteOpen ? '’' : '‘';
            }
            singleQuoteOpen = !singleQuoteOpen;
            continue;
        }

        result += char;
    }

    return result;
}

function convertBasicPunctuationToChinese(text: string) {
    let result = '';

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        const mapped = PUNCTUATION_MAP[char];

        if (!mapped || shouldSkipPunctuationConversion(text, index, char)) {
            result += char;
            continue;
        }

        result += mapped;
    }

    return result;
}

export function convertEnglishPunctuationToChinese(text: string) {
    return convertQuoteMarks(convertBasicPunctuationToChinese(text.replace(/\.{3,}/g, '……')), 'curly');
}

export function normalizeEllipsisAndDashes(text: string) {
    return text
        .replace(/\.{3,}|。{3,}/g, '……')
        .replace(/—{3,}/g, '——')
        .replace(/(?<!—)—(?!—)/g, '——')
        .replace(/-{2,}/g, '——');
}

function protectMarkdownSegments(text: string) {
    const protectedSegments: string[] = [];
    const storeProtectedSegment = (segment: string) => {
        const index = protectedSegments.push(segment) - 1;
        return `\u0000MDPROTECT${index}\u0000`;
    };

    let work = text.replace(
        /(^|[\r\n])(```|~~~)[^\r\n]*[\r\n][\s\S]*?[\r\n]\2[^\r\n]*(?=[\r\n]|$)/g,
        (match, prefix: string) => {
            const segment = prefix ? match.slice(prefix.length) : match;
            return `${prefix}${storeProtectedSegment(segment)}`;
        }
    );

    work = work.replace(/`[^`\r\n]+`/g, (match) => storeProtectedSegment(match));
    work = work.replace(/!\[[^\]]*]\([^)]+\)/g, (match) => storeProtectedSegment(match));
    work = work.replace(/\[[^\]]+]\([^)]+\)/g, (match) => storeProtectedSegment(match));
    work = work.replace(/<https?:\/\/[^>\s]+>/g, (match) => storeProtectedSegment(match));
    work = work.replace(/https?:\/\/[^\s]+/g, (match) => storeProtectedSegment(match));

    return { protectedSegments, work };
}

function protectMarkdownSeparators(text: string) {
    const separators: string[] = [];
    const work = text.replace(/^[ \t]{0,3}(?:-\s*){3,}[ \t]*(?:\r?\n)?/gm, (match) => {
        const index = separators.push(match) - 1;
        return `\u0000MDSEPARATOR${index}\u0000`;
    });

    return { separators, work };
}

export interface MarkdownNormalizationOptions {
    convertPunctuation?: boolean;
    useCornerQuotes?: boolean;
    normalizeEllipsisDashes?: boolean;
}

export function normalizeMarkdownForPreview(text: string, options: MarkdownNormalizationOptions = {}) {
    const {
        convertPunctuation = false,
        useCornerQuotes = false,
        normalizeEllipsisDashes = false
    } = options;

    const { separators, work: withProtectedSeparators } = protectMarkdownSeparators(text);
    const { protectedSegments, work: protectedText } = protectMarkdownSegments(withProtectedSeparators);
    let normalized = protectedText;

    if (convertPunctuation) {
        normalized = normalized.replace(/\u0000MDSEPARATOR(\d+)\u0000/g, '');
        normalized = convertBasicPunctuationToChinese(normalized);
        normalized = convertQuoteMarks(normalized, useCornerQuotes ? 'corner' : 'curly');
    }

    if (normalizeEllipsisDashes) {
        normalized = normalizeEllipsisAndDashes(normalized);
    }

    if (!convertPunctuation) {
        normalized = normalized.replace(/\u0000MDSEPARATOR(\d+)\u0000/g, (_match, index) => {
            return separators[Number(index)] ?? '';
        });
    }

    return normalized.replace(/\u0000MDPROTECT(\d+)\u0000/g, (_match, index) => {
        return protectedSegments[Number(index)] ?? '';
    });
}

export function normalizeHtmlPunctuation(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);

    let currentNode = walker.nextNode();
    while (currentNode) {
        const shouldSkip = Boolean(currentNode.parentElement?.closest('a, code, pre, script, style, textarea'));

        if (!shouldSkip && currentNode.textContent) {
            currentNode.textContent = convertEnglishPunctuationToChinese(currentNode.textContent);
        }

        currentNode = walker.nextNode();
    }

    return doc.body.innerHTML;
}

// Avoid bold fragmentation when pasting from certain apps
export function preprocessMarkdown(content: string) {
    content = content.replace(/^[ ]{0,3}(\*[ ]*\*[ ]*\*[\* ]*)[ \t]*$/gm, '***');
    content = content.replace(/^[ ]{0,3}(-[ ]*-[ ]*-[- ]*)[ \t]*$/gm, '---');
    content = content.replace(/^[ ]{0,3}(_[ ]*_[ ]*_[_ ]*)[ \t]*$/gm, '___');
    content = content.replace(/\*\*[ \t]+\*\*/g, ' ');
    content = content.replace(/\*{4,}/g, '');
    // markdown-it may fail to open bold when content starts with punctuation/symbol
    // and `**` is attached directly to preceding text (e.g. `至**-5%**。`).
    // Insert a zero-width separator only inside opening `**...` for these cases.
    content = content.replace(
        /([^\s])\*\*([+\-＋－%％~～!！?？,，.。:：;；、\\/|@#￥$^&*_=（）()【】\[\]《》〈〉「」『』“”"'`…·][^\n*]*?)\*\*/g,
        '$1**\u200B$2**'
    );
    return content;
}

export function applyTheme(html: string, themeId: string) {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    const style = theme.styles;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Note: Indexing is handled separately by markElementIndexes() function
    // to keep the core rendering logic decoupled from the click-to-locate feature

    // Specific inline overrides to prevent headings from uninheriting styles
    const headingInlineOverrides: Record<string, string> = {
        strong: 'font-weight: 700; color: inherit !important; background-color: transparent !important;',
        em: 'font-style: italic; color: inherit !important; background-color: transparent !important;',
        a: 'color: inherit !important; text-decoration: none !important; border-bottom: 1px solid currentColor !important; background-color: transparent !important;',
        code: 'color: inherit !important; background-color: transparent !important; border: none !important; padding: 0 !important;',
    };


    const getSingleImageNode = (p: HTMLParagraphElement): HTMLElement | null => {
        const children = Array.from(p.childNodes).filter(n =>
            !(n.nodeType === Node.TEXT_NODE && !(n.textContent || '').trim()) &&
            !(n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === 'BR')
        );
        if (children.length !== 1) return null;
        const onlyChild = children[0];
        if (onlyChild.nodeName === 'IMG') return onlyChild as HTMLElement;
        if (onlyChild.nodeName === 'A' && onlyChild.childNodes.length === 1 && onlyChild.childNodes[0].nodeName === 'IMG') {
            return onlyChild as HTMLElement;
        }
        return null;
    };

    // Check if a paragraph contains only images (for base64 images or multiple images in one paragraph)
    const isImageOnlyParagraph = (p: HTMLParagraphElement): boolean => {
        const children = Array.from(p.childNodes).filter(n =>
            !(n.nodeType === Node.TEXT_NODE && !(n.textContent || '').trim()) &&
            !(n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === 'BR')
        );
        if (children.length === 0) return false;
        return children.every(n =>
            n.nodeName === 'IMG' ||
            (n.nodeName === 'A' && n.childNodes.length === 1 && n.childNodes[0].nodeName === 'IMG')
        );
    };

    // Merge consecutive image-only paragraphs (same parent) into pair-wise side-by-side grids.
    const paragraphSnapshot = Array.from(doc.querySelectorAll('p'));
    const processed = new Set<HTMLParagraphElement>();

    for (const paragraph of paragraphSnapshot) {
        if (!paragraph.isConnected || processed.has(paragraph)) continue;
        if (!getSingleImageNode(paragraph) && !isImageOnlyParagraph(paragraph)) continue;

        const run: HTMLParagraphElement[] = [paragraph];
        processed.add(paragraph);

        let cursor = paragraph.nextElementSibling;
        while (cursor && cursor.tagName === 'P') {
            const p = cursor as HTMLParagraphElement;
            if (!getSingleImageNode(p) && !isImageOnlyParagraph(p)) break;
            run.push(p);
            processed.add(p);
            cursor = p.nextElementSibling;
        }

        if (run.length < 2) continue;

        // Collect all images from the run
        const allImages: HTMLElement[] = [];
        run.forEach(p => {
            if (getSingleImageNode(p)) {
                const img = getSingleImageNode(p);
                if (img) allImages.push(img);
            } else if (isImageOnlyParagraph(p)) {
                const images = p.querySelectorAll('img');
                images.forEach(img => allImages.push(img as HTMLElement));
            }
        });

        // Create grid paragraphs with 2 images each
        const firstParagraph = run[0];
        let lastInserted: HTMLElement | null = null;

        for (let i = 0; i < allImages.length; i += 2) {
            const gridParagraph = doc.createElement('p');
            gridParagraph.classList.add('image-grid');
            gridParagraph.setAttribute('style', 'display: flex; justify-content: center; gap: 8px; margin: 24px 0; align-items: flex-start;');

            gridParagraph.appendChild(allImages[i]);
            if (i + 1 < allImages.length) {
                gridParagraph.appendChild(allImages[i + 1]);
            }

            if (i === 0) {
                firstParagraph.before(gridParagraph);
                lastInserted = gridParagraph;
            } else if (lastInserted) {
                lastInserted.after(gridParagraph);
                lastInserted = gridParagraph;
            }
        }

        // Remove original paragraphs
        run.forEach(p => {
            if (p.isConnected) p.remove();
        });
    }

    // Process image grids
    const paragraphs = doc.querySelectorAll('p');
    paragraphs.forEach(p => {
        const children = Array.from(p.childNodes).filter(n => !(n.nodeType === Node.TEXT_NODE && !(n.textContent || '').trim()));
        const isAllImages = children.length > 1 && children.every(n => n.nodeName === 'IMG' || (n.nodeName === 'A' && n.childNodes.length === 1 && n.childNodes[0].nodeName === 'IMG'));

        if (isAllImages) {
            p.classList.add('image-grid');
            p.setAttribute('style', 'display: flex; justify-content: center; gap: 8px; margin: 24px 0; align-items: flex-start;');

            p.querySelectorAll('img').forEach(img => {
                img.classList.add('grid-img');
                const w = 100 / children.length;
                img.setAttribute('style', `width: calc(${w}% - ${8 * (children.length - 1) / children.length}px); margin: 0; border-radius: 8px; height: auto;`);
            });
        }
    });

    Object.keys(style).forEach((selector) => {

        if (selector === 'pre code') return;
        const elements = doc.querySelectorAll(selector);
        elements.forEach(el => {
            if (selector === 'code' && el.parentElement?.tagName === 'PRE') return;
            if (el.tagName === 'IMG' && el.closest('.image-grid')) return;
            const currentStyle = el.getAttribute('style') || '';
            el.setAttribute('style', currentStyle + '; ' + style[selector as keyof typeof style]);
        });
    });

    // Tailwind preflight removes native list markers. Restore explicit markers.
    doc.querySelectorAll('ul').forEach(ul => {
        const currentStyle = ul.getAttribute('style') || '';
        ul.setAttribute('style', `${currentStyle}; list-style-type: disc !important; list-style-position: outside;`);
    });
    doc.querySelectorAll('ul ul').forEach(ul => {
        const currentStyle = ul.getAttribute('style') || '';
        ul.setAttribute('style', `${currentStyle}; list-style-type: circle !important;`);
    });
    doc.querySelectorAll('ul ul ul').forEach(ul => {
        const currentStyle = ul.getAttribute('style') || '';
        ul.setAttribute('style', `${currentStyle}; list-style-type: square !important;`);
    });
    doc.querySelectorAll('ol').forEach(ol => {
        const currentStyle = ol.getAttribute('style') || '';
        ol.setAttribute('style', `${currentStyle}; list-style-type: decimal !important; list-style-position: outside;`);
    });

    const hljsLight: Record<string, string> = {
        'hljs-comment': 'color: #6a737d; font-style: normal;',
        'hljs-quote': 'color: #6a737d; font-style: normal;',
        'hljs-keyword': 'color: #d73a49; font-weight: 600;',
        'hljs-selector-tag': 'color: #d73a49; font-weight: 600;',
        'hljs-string': 'color: #032f62;',
        'hljs-title': 'color: #6f42c1; font-weight: 600;',
        'hljs-section': 'color: #6f42c1; font-weight: 600;',
        'hljs-type': 'color: #005cc5; font-weight: 600;',
        'hljs-number': 'color: #005cc5;',
        'hljs-literal': 'color: #005cc5;',
        'hljs-built_in': 'color: #005cc5;',
        'hljs-variable': 'color: #e36209;',
        'hljs-template-variable': 'color: #e36209;',
        'hljs-tag': 'color: #22863a;',
        'hljs-name': 'color: #22863a;',
        'hljs-attr': 'color: #6f42c1;',
    };

    const codeTokens = doc.querySelectorAll('.hljs span');
    codeTokens.forEach(span => {
        let inlineStyle = span.getAttribute('style') || '';
        if (inlineStyle && !inlineStyle.endsWith(';')) inlineStyle += '; ';
        span.classList.forEach(cls => {
            if (hljsLight[cls]) {
                inlineStyle += hljsLight[cls] + '; ';
            }
        });
        if (inlineStyle) {
            span.setAttribute('style', inlineStyle);
        }
    });

    doc.querySelectorAll('pre').forEach(pre => {
        const currentStyle = pre.getAttribute('style') || '';
        pre.setAttribute(
            'style',
            `${currentStyle}; font-variant-ligatures: none; tab-size: 2;`
        );
    });

    doc.querySelectorAll('pre code, pre .hljs, .hljs').forEach(codeNode => {
        const currentStyle = codeNode.getAttribute('style') || '';
        codeNode.setAttribute(
            'style',
            `${currentStyle}; display: block; font-size: inherit !important; line-height: inherit !important; font-style: normal !important; white-space: pre; word-break: normal; overflow-wrap: normal;`
        );
    });

    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
        Object.keys(headingInlineOverrides).forEach(tag => {
            heading.querySelectorAll(tag).forEach(node => {
                const override = headingInlineOverrides[tag];
                node.setAttribute('style', `${node.getAttribute('style') || ''}; ${override}`);
            });
        });
    });

    // Unify image look-and-feel across themes.
    doc.querySelectorAll('img').forEach(img => {
        const inGrid = Boolean(img.closest('.image-grid'));
        const currentStyle = img.getAttribute('style') || '';
        const appendedStyle = inGrid
            ? 'display:block; max-width:100%; height:auto; margin:0 !important; padding:8px !important; border-radius:14px !important; box-sizing:border-box; box-shadow:0 12px 28px rgba(15,23,42,0.18), 0 2px 8px rgba(15,23,42,0.12); border:1px solid rgba(255,255,255,0.75);'
            : 'display:block; width:100%; max-width:100%; height:auto; margin:30px auto !important; padding:8px !important; border-radius:14px !important; box-sizing:border-box; box-shadow:0 16px 34px rgba(15,23,42,0.22), 0 4px 10px rgba(15,23,42,0.12); border:1px solid rgba(15,23,42,0.12);';
        img.setAttribute('style', `${currentStyle}; ${appendedStyle}`);
    });

    const container = doc.createElement('div');
    container.setAttribute('style', style.container);
    container.innerHTML = doc.body.innerHTML;

    return container.outerHTML;
}
