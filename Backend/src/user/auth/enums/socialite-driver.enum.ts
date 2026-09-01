export enum SocialiteDriverType {
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
}

export function getAllSocialiteDrivers(): string[] {
  return [SocialiteDriverType.FACEBOOK, SocialiteDriverType.GOOGLE];
}