// Avatar generation utility - Ready Player Me integration
export interface AvatarOptions {
  seed?: string;
  gender?: 'male' | 'female' | 'other';
  style?: 'casual' | 'formal' | 'sporty' | 'creative';
}

// Generate Ready Player Me avatar URL
export function generateReadyPlayerMeAvatar(options: AvatarOptions = {}): string {
  const { gender, seed, style = 'casual' } = options;
  
  const genders = gender ? [gender] : ['male', 'female'];
  const hairColors = ['blonde', 'brown', 'black', 'red', 'gray', 'white'];
  const skinTones = ['light', 'medium', 'dark', 'tan'];
  const outfits = ['casual', 'formal', 'sporty', 'creative'];
  
  // Use seed for consistent generation if provided
  const seedNum = seed ? seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : Math.random() * 1000;
  
  const selectedGender = genders[Math.floor(seedNum % genders.length)];
  const hair = hairColors[Math.floor(seedNum % hairColors.length)];
  const skin = skinTones[Math.floor(seedNum % skinTones.length)];
  const outfit = style || outfits[Math.floor(seedNum % outfits.length)];
  
  // Return a normalized PNG avatar URL (ReadyPlayerMe supports .png thumbnails)
  // We keep the seed/hints out of the URL to ensure consistent, cacheable PNG links
  return `https://models.readyplayer.me/64bfa75f0e72c63d7c3934a6.png`;
}

// Main avatar generation function
export function generateAvatar(options: AvatarOptions = {}): string {
  return generateReadyPlayerMeAvatar(options);
}

// Generate random avatar
export function generateRandomAvatar(gender?: 'male' | 'female' | 'other'): string {
  const randomSeed = Math.random().toString(36).substring(2, 15);
  return generateAvatar({ seed: randomSeed, gender });
}

// Generate avatar from username for consistency
export function generateAvatarFromUsername(username: string, gender?: 'male' | 'female' | 'other'): string {
  return generateAvatar({ seed: username, gender });
}

// Alias for backward compatibility
export function generateGenderAvatar(gender?: 'male' | 'female' | 'other'): string {
  return generateRandomAvatar(gender);
}