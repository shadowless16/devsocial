import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';

export type AvatarStyle = 'lorelei';

export function generateDiceBearAvatar(seed: string, style: AvatarStyle = 'lorelei'): string {
  const avatar = createAvatar(lorelei, {
    seed,
    size: 128,
  });
  
  return avatar.toDataUri();
}

export function getAvatarStyleForUser(username: string): AvatarStyle {
  return 'lorelei';
}
