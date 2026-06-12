let getToken: () => string | null = () => null;

export function registerTokenGetter(getter: () => string | null): void {
  getToken = getter;
}

export function getCurrentToken(): string | null {
  return getToken();
}
