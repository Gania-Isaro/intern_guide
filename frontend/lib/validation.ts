export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return "Email is required";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address";
  }
  return null;
}
export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  return null;
}

export function validateFullName(fullName: string): string | null {
  if (!fullName.trim()) {
    return "Full name is required";
  }
  return null;
}
export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | null {
  if (confirmPassword !== password) {
    return "Passwords do not match";
  }
  return null;
}

export function validateRegisterForm(formData: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const errors: Record<string, string> = {};

  const fullNameError = validateFullName(formData.fullName);
  if (fullNameError) errors.fullName = fullNameError;

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  const confirmPasswordError = validateConfirmPassword(
    formData.password,
    formData.confirmPassword
  );
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  return errors;
}


export function validateLoginForm(formData: { email: string; password: string }) {
  const errors: Record<string, string> = {};

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  return errors;
}

export interface ReviewScores {
  mentorship: number;
  tasks: number;
  learning: number;
  environment: number;
}

// Every category needs a star rating before the form can be sent.
// A score of 0 means "not chosen yet".
export function validateReviewForm(scores: ReviewScores) {
  const errors: Record<string, string> = {};

  for (const [name, value] of Object.entries(scores)) {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      errors[name] = "Pick a rating from 1 to 5 stars";
    }
  }

  return errors;
}
