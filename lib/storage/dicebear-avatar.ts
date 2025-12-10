import { createAvatar } from '@dicebear/core';
import { avataaars, bigSmile, funEmoji, thumbs } from '@dicebear/collection';

export function generateDiceBearAvatar(
  seed: string, 
  gender?: 'male' | 'female' | 'other'
): string {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  let style;
  if (gender === 'female') {
    style = hash % 2 === 0 ? bigSmile : avataaars;
  } else if (gender === 'male') {
    style = hash % 2 === 0 ? thumbs : avataaars;
  } else {
    const styles = [funEmoji, avataaars, bigSmile, thumbs];
    style = styles[hash % styles.length];
  }
  
  const avatar = createAvatar(style, {
    seed,
    size: 128,
  });
  
  return avatar.toDataUri();
}

export function getAvatarStyleForUser(): string {
  return 'avataaars';
}
