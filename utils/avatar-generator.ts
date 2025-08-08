export function generateGenderAvatar(username: string, gender: "male" | "female" | "other") {
  const seed = username;
  
  if (gender === "male") {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=male`;
  } else if (gender === "female") {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=female`;
  } else {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  }
}