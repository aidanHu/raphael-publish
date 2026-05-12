import { beforeEach, describe, expect, it } from 'vitest';
import { createDefaultProfile, createProfile, loadProfiles, saveProfiles } from './index';

describe('profiles storage', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('returns a default profile set when storage is empty', () => {
        const state = loadProfiles();

        expect(state.profiles).toHaveLength(1);
        expect(state.activeProfileId).toBe(state.profiles[0].id);
        expect(state.profiles[0].showAuthorInfo).toBe(true);
        expect(state.profiles[0].showAboutSection).toBe(true);
        expect(state.profiles[0].headerAlignment).toBe('left');
        expect(state.profiles[0].footerAlignment).toBe('center');
    });

    it('persists and restores multiple profiles with the active selection', () => {
        const profileA = createDefaultProfile('专栏 A');
        const profileB = createProfile('专栏 B');
        profileB.authorName = 'Raphael';
        profileB.aboutLines = ['第一行', '', '第三行'];
        profileB.headerAlignment = 'right';
        profileB.footerAlignment = 'left';

        saveProfiles({
            profiles: [profileA, profileB],
            activeProfileId: profileB.id
        });

        const restored = loadProfiles();

        expect(restored.profiles).toHaveLength(2);
        expect(restored.activeProfileId).toBe(profileB.id);
        expect(restored.profiles[1].authorName).toBe('Raphael');
        expect(restored.profiles[1].aboutLines).toEqual(['第一行', '', '第三行']);
        expect(restored.profiles[1].headerAlignment).toBe('right');
        expect(restored.profiles[1].footerAlignment).toBe('left');
    });

    it('falls back to the first profile when the stored active id is missing', () => {
        const profile = createDefaultProfile('唯一账户');

        window.localStorage.setItem('raphael-publish.account-profiles.v1', JSON.stringify({
            profiles: [profile],
            activeProfileId: 'missing'
        }));

        const restored = loadProfiles();

        expect(restored.activeProfileId).toBe(profile.id);
    });
});
