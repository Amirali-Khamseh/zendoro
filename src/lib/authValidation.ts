export function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

// Login only gates on length — signup/reset require full complexity below.
export function isValidLoginPassword(password: string): boolean {
  return password.length >= 6;
}

export function isStrongPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-+_!@#$%^&*.,?]).{8,}$/.test(
    password,
  );
}

export function isValidSixDigitCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}
