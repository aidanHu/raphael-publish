import { describe, expect, it } from 'vitest';
import { applyTheme, convertEnglishPunctuationToChinese, md, normalizeHtmlPunctuation, normalizeMarkdownForPreview, preprocessMarkdown } from './markdown';

function renderMarkdown(markdown: string) {
    return md.render(preprocessMarkdown(markdown));
}

describe('preprocessMarkdown', () => {
    it('keeps bold rendering intact next to trailing punctuation', () => {
        const html = renderMarkdown('2025年初，伦敦黄金市场的一个月拆借利率一度升至**5%**。');

        expect(html).toContain('<strong>5%</strong>。');
        expect(html).not.toContain('**5%**');
    });

    it('repairs bold segments that start with a symbol and attach to previous text', () => {
        const html = renderMarkdown('利率变化至**-5%**。');
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const strong = doc.querySelector('strong');

        expect(strong?.textContent?.replace(/\u200B/g, '')).toBe('-5%');
    });

    it('does not merge separate bold blocks across blank lines', () => {
        const html = renderMarkdown('**5 %**\n\n**5%**');
        const doc = new DOMParser().parseFromString(html, 'text/html');

        expect(doc.querySelectorAll('strong')).toHaveLength(2);
    });
});

describe('convertEnglishPunctuationToChinese', () => {
    it('converts only common prose punctuation', () => {
        expect(convertEnglishPunctuationToChinese('Hello, world! "test" (A/B)')).toBe('Hello， world！ “test” （A／B）');
    });

    it('renders paired double quotes correctly in chinese text', () => {
        expect(convertEnglishPunctuationToChinese('"现象层",有点问题')).toBe('“现象层”，有点问题');
    });

    it('preserves decimal points, list markers and inline apostrophes', () => {
        expect(convertEnglishPunctuationToChinese("1. First item, don't panic. Price is 3.14.")).toBe("1. First item， don't panic。 Price is 3.14。");
    });
});

describe('normalizeHtmlPunctuation', () => {
    it('converts punctuation in text nodes only', () => {
        const html = '<p>1. 你好, "世界" (A/B).</p><pre><code>const a = 1 + 2;</code></pre><p><a href="https://example.com?a=1&b=2">https://example.com?a=1&b=2</a></p>';
        const normalized = normalizeHtmlPunctuation(html);
        const doc = new DOMParser().parseFromString(normalized, 'text/html');

        expect(doc.querySelector('p')?.textContent).toBe('1. 你好， “世界” （A／B）。');
        expect(doc.querySelector('code')?.textContent).toBe('const a = 1 + 2;');
        expect(doc.querySelector('a')?.textContent).toBe('https://example.com?a=1&b=2');
    });
});

describe('normalizeMarkdownForPreview', () => {
    it('converts prose punctuation and removes thematic breaks before rendering', () => {
        const normalized = normalizeMarkdownForPreview('Hello, world!\n\n---\n\nNext line.');

        expect(normalized).toBe('Hello， world！\n\nNext line。');
    });

    it('preserves code, urls and markdown links while keeping list markers intact', () => {
        const normalized = normalizeMarkdownForPreview([
            '1. First item, keep going.',
            '',
            'URL: https://example.com/a/b?x=1&y=2',
            '',
            '[Link, text](https://example.com/a/b)',
            '',
            '`const ratio = 3.14;`',
            '',
            '```ts',
            'const url = "https://example.com/a/b";',
            '```'
        ].join('\n'));

        expect(normalized).toContain('1. First item， keep going。');
        expect(normalized).toContain('https://example.com/a/b?x=1&y=2');
        expect(normalized).toContain('[Link, text](https://example.com/a/b)');
        expect(normalized).toContain('`const ratio = 3.14;`');
        expect(normalized).toContain('const url = "https://example.com/a/b";');
    });

    it('removes spaced markdown separators too', () => {
        const normalized = normalizeMarkdownForPreview('alpha\n\n- - -\n\nbeta');

        expect(normalized).toBe('alpha\n\nbeta');
    });
});

describe('applyTheme', () => {
    it('groups consecutive standalone images into an image grid', () => {
        const html = '<p><img src="a.png" /></p><p><img src="b.png" /></p>';
        const themed = applyTheme(html, 'apple');
        const doc = new DOMParser().parseFromString(themed, 'text/html');
        const grid = doc.querySelector('.image-grid');

        expect(grid).not.toBeNull();
        expect(grid?.querySelectorAll('img')).toHaveLength(2);
    });

    it('keeps highlighted comments non-italic for apple', () => {
        const rawHtml = renderMarkdown('```javascript\n// 中文注释\nconst raphael = 1;\n```');
        const themed = applyTheme(rawHtml, 'apple');
        const doc = new DOMParser().parseFromString(themed, 'text/html');
        const code = doc.querySelector('pre code');
        const comment = doc.querySelector('.hljs-comment');

        expect(code?.getAttribute('style')).toContain('font-style: normal !important;');
        expect(code?.getAttribute('style')).toContain('white-space: pre;');
        expect(comment?.getAttribute('style')).toContain('font-style: normal;');
    });

    it('does not override bloomberg block-code font inheritance', () => {
        const rawHtml = renderMarkdown('```javascript\n// terminal theme\nconst raphael = 1;\n```');
        const themed = applyTheme(rawHtml, 'bloomberg');
        const doc = new DOMParser().parseFromString(themed, 'text/html');
        const container = doc.querySelector('body > div');
        const pre = doc.querySelector('pre');
        const code = doc.querySelector('pre code');

        expect(container?.getAttribute('style')).toContain('"Courier New"');
        expect(pre?.getAttribute('style')).not.toContain('font-family:');
        expect(code?.getAttribute('style')).not.toContain('font-family:');
        expect(themed).not.toContain('"SF Mono", "Cascadia Code", "Fira Code", Consolas, Menlo, Monaco, monospace');
    });
});
