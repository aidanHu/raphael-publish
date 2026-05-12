export type ProfileAlignment = 'left' | 'center' | 'right';

export interface AccountProfile {
  id: string;
  name: string;
  authorName: string;
  imageSource: string;
  issuePrefix: string;
  issueNumber: string;
  issueSuffix: string;
  aboutTitle: string;
  aboutLines: string[];
  headerAlignment: ProfileAlignment;
  footerAlignment: ProfileAlignment;
  showAuthorInfo: boolean;
  showAboutSection: boolean;
}

export interface ProfilesState {
  profiles: AccountProfile[];
  activeProfileId: string;
}
