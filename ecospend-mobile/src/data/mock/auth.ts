export const MOCK_LOGIN_DELAY_MS = 1500;
export const MOCK_REGISTER_DELAY_MS = 1500;
export const SPLASH_DURATION_MS = 2500;
export const SPLASH_LOGO_FADE_MS = 800;
export const REGISTER_SUCCESS_NAV_DELAY_MS = 1200;

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
