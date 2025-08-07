
export interface IUser {
  email?: string;
  password?: string;
  name?: string;
  role?: "creator" | "consumer" | "admin";
}
export interface IUserWithTokens extends IUser {
  access: string;
  refresh: string;
}