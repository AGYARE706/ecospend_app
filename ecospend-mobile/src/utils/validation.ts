export function validatePhone(phone: string): string | null {
  if (!/^\d{10}$/.test(phone)) {
    return 'Phone number must be exactly 10 digits';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirm: string,
): string | null {
  if (password !== confirm) {
    return 'Passwords do not match';
  }
  return null;
}
