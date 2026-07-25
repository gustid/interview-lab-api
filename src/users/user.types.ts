export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export type PublicUserRecord = Omit<UserRecord, 'password_hash'>;

export interface CreateUserRecord {
  email: string;
  password_hash: string;
  name: string;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
}
