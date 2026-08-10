import { UserProfile, UpdateUserProfileData } from "../schemas/user";

export interface IUserRepository {
  getUserProfile(userId: string): Promise<UserProfile | null>;
  getProfileByUsername(username: string): Promise<UserProfile | null>;
  updateUserProfile(userId: string, data: UpdateUserProfileData): Promise<{ success: boolean; message: string; data?: UserProfile }>;
  isUsernameAvailable(username: string, excludeUserId: string): Promise<boolean>;
  getUsernameLastChange(userId: string): Promise<Date | null>;
  deleteUser(userId: string): Promise<boolean>;
}
