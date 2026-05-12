import { describe, expect, it } from 'vitest';
import { composeDocumentHtml, getDocumentMetrics } from './documentComposer';
import { createDefaultProfile } from './profiles';
import { THEMES } from './themes';

describe('getDocumentMetrics', () => {
    it('ignores markdown syntax and derives a minimum reading time of one minute', () => {
        const metrics = getDocumentMetrics('# 标题\n\n**正文** with [link](https://example.com)');

        expect(metrics.wordCount).toBeGreaterThan(0);
        expect(metrics.readTimeMinutes).toBe(1);
    });
});

describe('composeDocumentHtml', () => {
    it('injects profile header, end marker and about section into themed content', () => {
        const profile = createDefaultProfile('北欧专栏');
        profile.authorName = 'Aidan';
        profile.aboutTitle = '关于作者';
        profile.aboutLines = ['长期写作', '**关注**产品与技术'];
        const theme = THEMES.find((item) => item.id === 'sspai') || THEMES[0];

        const html = composeDocumentHtml(
            '<div style="color:#333;"><p data-md-type="paragraph" data-md-index="0">正文</p></div>',
            theme,
            profile,
            { wordCount: 860, readTimeMinutes: 3 }
        );
        const doc = new DOMParser().parseFromString(html, 'text/html');

        expect(doc.body.textContent).toContain('文 | Aidan');
        expect(doc.body.textContent).toContain('预计阅读 3 分钟');
        expect(doc.body.textContent).toContain('关于作者');
        expect(doc.body.textContent).toContain('-- END --');
        expect(doc.body.textContent).not.toContain('北欧专栏');
        expect(doc.querySelector('[data-md-type="paragraph"]')?.textContent).toBe('正文');
        expect(html).toContain('color:#d71a1b');
        expect(html).toContain(`这是第<span style="color:#d71a1b; font-weight:700;">1</span>篇文章`);
        expect(html).toContain('<strong style="color:#d71a1b; font-weight:700;">关注</strong>');
    });

    it('respects profile toggles when header or about section are disabled', () => {
        const profile = createDefaultProfile();
        profile.showAuthorInfo = false;
        profile.showAboutSection = false;
        const theme = THEMES.find((item) => item.id === 'apple') || THEMES[0];

        const html = composeDocumentHtml(
            '<div style="color:#333;"><p>正文</p></div>',
            theme,
            profile,
            { wordCount: 120, readTimeMinutes: 1 }
        );

        expect(html).not.toContain('文 |');
        expect(html).not.toContain(profile.aboutTitle);
        expect(html).toContain('-- END --');
    });

    it('applies independent header and footer alignment choices', () => {
        const profile = createDefaultProfile('对齐测试');
        profile.headerAlignment = 'right';
        profile.footerAlignment = 'left';
        const theme = THEMES.find((item) => item.id === 'apple') || THEMES[0];

        const html = composeDocumentHtml(
            '<div style="color:#333;"><p>正文</p></div>',
            theme,
            profile,
            { wordCount: 120, readTimeMinutes: 1 }
        );

        expect(html).toContain('text-align:right;');
        expect(html).toContain('text-align:left;');
    });

    it('does not insert a divider line between profile header and article body', () => {
        const profile = createDefaultProfile();
        const theme = THEMES.find((item) => item.id === 'apple') || THEMES[0];

        const html = composeDocumentHtml(
            '<div style="color:#333;"><h1>正文标题</h1></div>',
            theme,
            profile,
            { wordCount: 120, readTimeMinutes: 1 }
        );
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const firstSection = doc.querySelector('section');

        expect(firstSection?.getAttribute('style')).not.toContain('border-bottom');
    });

    it('does not insert a divider line before the about section', () => {
        const profile = createDefaultProfile();
        const theme = THEMES.find((item) => item.id === 'apple') || THEMES[0];

        const html = composeDocumentHtml(
            '<div style="color:#333;"><p>正文</p></div>',
            theme,
            profile,
            { wordCount: 120, readTimeMinutes: 1 }
        );
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const sections = Array.from(doc.querySelectorAll('section'));
        const aboutSection = sections.find((section) => section.textContent?.includes(profile.aboutTitle));

        expect(aboutSection?.getAttribute('style')).not.toContain('border-top');
    });

    it('uses one consistent end marker across themes', () => {
        const profile = createDefaultProfile();
        const githubTheme = THEMES.find((item) => item.id === 'github') || THEMES[0];
        const sspaiTheme = THEMES.find((item) => item.id === 'sspai') || THEMES[0];

        const githubHtml = composeDocumentHtml(
            '<div style="color:#333;"><p>正文</p></div>',
            githubTheme,
            profile,
            { wordCount: 120, readTimeMinutes: 1 }
        );
        const sspaiHtml = composeDocumentHtml(
            '<div style="color:#333;"><p>正文</p></div>',
            sspaiTheme,
            profile,
            { wordCount: 120, readTimeMinutes: 1 }
        );

        expect(githubHtml).toContain('-- END --');
        expect(sspaiHtml).toContain('-- END --');
        expect(githubHtml).not.toContain('EOF');
        expect(sspaiHtml).not.toContain('少数派');
        expect(sspaiHtml).not.toContain('border-radius:999px');
    });

    it('keeps account config names and chrome borders out of published profile blocks', () => {
        const profile = createDefaultProfile('只用于后台识别');
        const sspaiTheme = THEMES.find((item) => item.id === 'sspai') || THEMES[0];

        const html = composeDocumentHtml(
            '<div style="color:#333;"><p>正文</p></div>',
            sspaiTheme,
            profile,
            { wordCount: 120, readTimeMinutes: 1 }
        );
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const sections = Array.from(doc.querySelectorAll('section'));

        expect(doc.body.textContent).not.toContain('只用于后台识别');
        sections.forEach((section) => {
            const style = section.getAttribute('style') || '';
            expect(style).not.toContain('border:');
            expect(style).not.toContain('border-left');
        });
    });
});
