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

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type VerifyEmailInput = {
  token: string;
};

export type SendVerificationEmailInput = {
  id: string;
  email: string;
};
