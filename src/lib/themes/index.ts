import type { Theme, ThemeChromeVariant, ThemeDefinition } from './types';
import { classicThemes as classicThemeDefinitions } from './classic';
import { modernThemes as modernThemeDefinitions } from './modern';
import { extraThemes as extraThemeDefinitions } from './extra';

export type { Theme };
const THEME_CHROME_VARIANTS: Partial<Record<string, ThemeChromeVariant>> = {
  apple: 'minimal',
  claude: 'editorial',
  wechat: 'minimal',
  medium: 'editorial',
  linear: 'spotlight',
  retro: 'editorial',
  notion: 'minimal',
  github: 'minimal',
  sspai: 'card',
  stripe: 'card',
  feishu: 'card',
  monokai: 'spotlight',
  cyberpunk: 'spotlight',
  ink: 'editorial',
  bauhaus: 'card',
  copper: 'spotlight',
};

function withChrome(themes: ThemeDefinition[]): Theme[] {
  return themes.map((theme) => ({
    ...theme,
    chrome: THEME_CHROME_VARIANTS[theme.id] ?? 'minimal'
  }));
}

const classicThemes = withChrome(classicThemeDefinitions);
const modernThemes = withChrome(modernThemeDefinitions);
const extraThemes = withChrome(extraThemeDefinitions);

export const THEMES: Theme[] = [...classicThemes, ...modernThemes, ...extraThemes];

export interface ThemeGroup {
  label: string;
  themes: Theme[];
}

export const THEME_GROUPS: ThemeGroup[] = [
  { label: '经典', themes: classicThemes },
  { label: '潮流', themes: modernThemes },
  { label: '更多风格', themes: extraThemes },
];
