import type { AccountProfile, ProfileAlignment, ProfilesState } from './types';

const STORAGE_KEY = 'raphael-publish.account-profiles.v1';

function createProfileId() {
    return `profile_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function toStringValue(value: unknown, fallback: string) {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return fallback;
}

function toStringArray(value: unknown, fallback: string[]) {
    if (!Array.isArray(value)) return fallback;
    const lines = value.map((item) => (typeof item === 'string' ? item : typeof item === 'number' ? String(item) : ''));

    return lines.length > 0 ? lines : fallback;
}

function toBooleanValue(value: unknown, fallback: boolean) {
    return typeof value === 'boolean' ? value : fallback;
}

function toAlignmentValue(value: unknown, fallback: ProfileAlignment): ProfileAlignment {
    return value === 'left' || value === 'center' || value === 'right'
        ? value
        : fallback;
}

export function createDefaultProfile(name = '默认账户'): AccountProfile {
    return {
        id: createProfileId(),
        name,
        authorName: '作者',
        imageSource: '网络',
        issuePrefix: '这是第',
        issueNumber: '1',
        issueSuffix: '篇文章',
        aboutTitle: '关于我',
        aboutLines: [
            '一个热爱写作的人',
            '分享有价值的内容',
            '',
            '喜欢就关注我吧',
            '欢迎留言交流'
        ],
        headerAlignment: 'left',
        footerAlignment: 'center',
        showAuthorInfo: true,
        showAboutSection: true
    };
}

function normalizeProfile(raw: unknown, index: number): AccountProfile {
    const fallback = createDefaultProfile(`账户 ${index + 1}`);
    const profile = typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : {};

    return {
        id: toStringValue(profile.id, fallback.id),
        name: toStringValue(profile.name, fallback.name),
        authorName: toStringValue(profile.authorName, fallback.authorName),
        imageSource: toStringValue(profile.imageSource, fallback.imageSource),
        issuePrefix: toStringValue(profile.issuePrefix, fallback.issuePrefix),
        issueNumber: toStringValue(profile.issueNumber, fallback.issueNumber),
        issueSuffix: toStringValue(profile.issueSuffix, fallback.issueSuffix),
        aboutTitle: toStringValue(profile.aboutTitle, fallback.aboutTitle),
        aboutLines: toStringArray(profile.aboutLines, fallback.aboutLines),
        headerAlignment: toAlignmentValue(profile.headerAlignment, fallback.headerAlignment),
        footerAlignment: toAlignmentValue(profile.footerAlignment, fallback.footerAlignment),
        showAuthorInfo: toBooleanValue(profile.showAuthorInfo, fallback.showAuthorInfo),
        showAboutSection: toBooleanValue(profile.showAboutSection, fallback.showAboutSection)
    };
}

function getDefaultState(): ProfilesState {
    const defaultProfile = createDefaultProfile();
    return {
        profiles: [defaultProfile],
        activeProfileId: defaultProfile.id
    };
}

export function loadProfiles(): ProfilesState {
    if (typeof window === 'undefined') {
        return getDefaultState();
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        return getDefaultState();
    }

    try {
        const parsed = JSON.parse(saved) as Partial<ProfilesState> | AccountProfile[];
        const rawProfiles = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.profiles)
                ? parsed.profiles
                : [];

        const profiles = rawProfiles.map(normalizeProfile);
        if (profiles.length === 0) {
            return getDefaultState();
        }

        const requestedActiveId = !Array.isArray(parsed) && typeof parsed?.activeProfileId === 'string'
            ? parsed.activeProfileId
            : profiles[0].id;

        const activeProfileId = profiles.some((profile) => profile.id === requestedActiveId)
            ? requestedActiveId
            : profiles[0].id;

        return { profiles, activeProfileId };
    } catch {
        return getDefaultState();
    }
}

export function saveProfiles(state: ProfilesState) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createProfile(name: string) {
    return createDefaultProfile(name);
}

export function getNextProfileName(profiles: AccountProfile[]) {
    return `账户 ${profiles.length + 1}`;
}

export type { AccountProfile, ProfilesState } from './types';
