export type User = {
  id: string;
  email: string;
  emailVerified: boolean;
};
export type LoginInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterInput = {
  email: string;
  password: string;
  confirmPassword: string;
};
export type ForgotPassword = {
  email: string;
};

export type ResetPassword = {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type VerifyEmail = {
  token: string;
};

export type SendVerificationEmail = {
  id: string;
  email: string;
};
