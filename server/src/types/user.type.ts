import { user } from "src/db/schema";

export type NewUser = typeof user.$inferInsert;
export type UserRow = typeof user.$inferSelect;

export interface ClerkEmail {
  id: string;
  email_address: string;
}

export interface ClerkUserCreatedData {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  profile_image_url?: string | null;
  email_addresses: ClerkEmail[];
  created_at: number;
  updated_at: number;
}

export interface ClerkWebhookPayload<T> {
  type: string;
  data: T;
}
