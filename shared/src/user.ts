export type User = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  givenName: string | null;
  familyName: string | null;
  picture: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserPublic = Pick<User, "id" | "email" | "emailVerified" | "name" | "givenName" | "familyName" | "picture">;
