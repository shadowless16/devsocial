import { describe, it, expect } from 'vitest';
import { generateAvatar, generateRandomAvatar, generateAvatarFromUsername } from '@/utils/avatar-generator';

describe('Avatar Generator', () => {
  describe('generateAvatar', () => {
    it('should generate avatar with default parameters', () => {
      const avatar = generateAvatar();
      expect(avatar).toContain('https://models.readyplayer.me');
      expect(avatar).toContain('seed=');
    });

    it('should generate avatar with custom seed', () => {
      const avatar = generateAvatar({ seed: 'testuser' });
      expect(avatar).toContain('seed=testuser');
    });

    it('should generate male avatar', () => {
      const avatar = generateAvatar({ seed: 'testuser', gender: 'male' });
      expect(avatar).toContain('seed=testuser');
      expect(avatar).toContain('gender=male');
    });

    it('should generate female avatar', () => {
      const avatar = generateAvatar({ seed: 'testuser', gender: 'female' });
      expect(avatar).toContain('seed=testuser');
      expect(avatar).toContain('gender=female');
    });

    it('should generate avatar without gender for other', () => {
      const avatar = generateAvatar({ seed: 'testuser', gender: 'other' });
      expect(avatar).toContain('seed=testuser');
      expect(avatar).not.toContain('gender=');
    });

    it('should use different avatar styles', () => {
      const avatar = generateAvatar({ seed: 'testuser', style: 'personas' });
      expect(avatar).toContain('https://models.readyplayer.me');
      expect(avatar).toContain('seed=testuser');
    });
  });

  describe('generateRandomAvatar', () => {
    it('should generate random avatar', () => {
      const avatar1 = generateRandomAvatar();
      const avatar2 = generateRandomAvatar();
      
      expect(avatar1).toContain('https://models.readyplayer.me');
      expect(avatar2).toContain('https://models.readyplayer.me');
      expect(avatar1).not.toBe(avatar2); // Should be different due to random seed
    });

    it('should generate random male avatar', () => {
      const avatar = generateRandomAvatar('male');
      expect(avatar).toContain('gender=male');
    });

    it('should generate random female avatar', () => {
      const avatar = generateRandomAvatar('female');
      expect(avatar).toContain('gender=female');
    });
  });

  describe('generateAvatarFromUsername', () => {
    it('should generate consistent avatar for same username', () => {
      const avatar1 = generateAvatarFromUsername('testuser');
      const avatar2 = generateAvatarFromUsername('testuser');
      
      expect(avatar1).toBe(avatar2);
      expect(avatar1).toContain('seed=testuser');
    });

    it('should generate different avatars for different usernames', () => {
      const avatar1 = generateAvatarFromUsername('user1');
      const avatar2 = generateAvatarFromUsername('user2');
      
      expect(avatar1).not.toBe(avatar2);
      expect(avatar1).toContain('seed=user1');
      expect(avatar2).toContain('seed=user2');
    });

    it('should generate gendered avatar from username', () => {
      const avatar = generateAvatarFromUsername('testuser', 'female');
      expect(avatar).toContain('seed=testuser');
      expect(avatar).toContain('gender=female');
    });
  });
});