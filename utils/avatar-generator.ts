// Avatar generation utility - now supports both DiceBear (fallback) and Ready Player Me
export interface AvatarOptions {
  seed?: string;
  gender?: 'male' | 'female' | 'other';
  style?: 'avataaars' | 'personas' | 'lorelei' | 'notionists';
}

// Generate Ready Player Me avatar URL (for random generation)
export function generateReadyPlayerMeAvatar(gender?: 'male' | 'female' | 'other'): string {
  const genders = gender ? [gender] : ['male', 'female'];
  const hairColors = ['blonde', 'brown', 'black', 'red', 'gray'];
  const skinTones = ['light', 'medium', 'dark'];
  const outfits = ['casual', 'formal', 'sporty'];
  
  const selectedGender = genders[Math.floor(Math.random() * genders.length)];
  const hair = hairColors[Math.floor(Math.random() * hairColors.length)];
  const skin = skinTones[Math.floor(Math.random() * skinTones.length)];
  const outfit = outfits[Math.floor(Math.random() * outfits.length)];
  
  return `https://readyplayer.me/avatar?frameApi&bodyType=halfbody&gender=${selectedGender}&hairColor=${hair}&skinTone=${skin}&outfit=${outfit}&timestamp=${Date.now()}`;
}

// Fallback DiceBear avatar generation
export function generateAvatar(options: AvatarOptions = {}): string {
  const { 
    seed = Math.random().toString(36).substring(7), 
    gender, 
    style = 'avataaars' 
  } = options;

  const baseUrl = `https://api.dicebear.com/7.x/${style}/svg`;
  const params = new URLSearchParams({ seed });

  if (style === 'avataaars' && gender) {
    if (gender === 'male') {
      params.append('gender', 'male');
    } else if (gender === 'female') {
      params.append('gender', 'female');
    }
  }

  return `${baseUrl}?${params.toString()}`;
}

// Use Ready Player Me by default, fallback to DiceBear
export function generateRandomAvatar(gender?: 'male' | 'female' | 'other'): string {
  const randomSeed = Math.random().toString(36).substring(2, 15);
  return generateAvatar({ seed: randomSeed, gender });
}

export function generateAvatarFromUsername(username: string, gender?: 'male' | 'female' | 'other'): string {
  // For username-based avatars, use DiceBear for consistency
  return generateAvatar({ seed: username, gender });
}

// Alias for backward compatibility
export function generateGenderAvatar(gender?: 'male' | 'female' | 'other'): string {
  return generateRandomAvatar(gender);
}