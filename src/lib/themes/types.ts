export type ThemeChromeVariant = 'minimal' | 'card' | 'editorial' | 'spotlight';

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  styles: Record<string, string>;
}

export interface Theme extends ThemeDefinition {
  chrome: ThemeChromeVariant;
}
