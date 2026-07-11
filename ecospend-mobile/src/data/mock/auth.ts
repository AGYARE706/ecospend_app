export const MOCK_LOGIN_DELAY_MS = 1500;
export const MOCK_REGISTER_DELAY_MS = 1500;
export const MOCK_RESET_REQUEST_DELAY_MS = 1200;
export const MOCK_RESET_PASSWORD_DELAY_MS = 1500;
export const RESET_SUCCESS_NAV_DELAY_MS = 1200;
export const SPLASH_DURATION_MS = 2500;
export const SPLASH_LOGO_FADE_MS = 800;
export const REGISTER_SUCCESS_NAV_DELAY_MS = 1200;

/** Mock OTP accepted in development — shown as a hint on the reset screen. */
export const MOCK_RESET_CODE = '123456';

export interface MockRegisterPayload {
  name: string;
  phone: string;
  password: string;
}

export interface MockAuthResponse {
  token: string;
  user: {
    name: string;
    phone: string;
  };
}

export function mockLogin(
  phone: string,
  _password: string,
): Promise<MockAuthResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        token: 'mock-token',
        user: {
          name: 'EcoSpend User',
          phone,
        },
      });
    }, MOCK_LOGIN_DELAY_MS);
  });
}

export function mockRegister(
  payload: MockRegisterPayload,
): Promise<MockAuthResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        token: 'mock-token',
        user: {
          name: payload.name,
          phone: payload.phone,
        },
      });
    }, MOCK_REGISTER_DELAY_MS);
  });
}

export interface MockResetPasswordPayload {
  phone: string;
  code: string;
  password: string;
}

export function mockRequestPasswordReset(phone: string): Promise<{ phone: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ phone });
    }, MOCK_RESET_REQUEST_DELAY_MS);
  });
}

export function mockResetPassword(
  payload: MockResetPasswordPayload,
): Promise<{ success: true }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (payload.code !== MOCK_RESET_CODE) {
        reject(new Error('Invalid verification code'));
        return;
      }

      resolve({ success: true });
    }, MOCK_RESET_PASSWORD_DELAY_MS);
  });
}
