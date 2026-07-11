function isValidEmail(email) {
  return /^(?!\.)(?!.*\.\.)([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+)\.([A-Za-z]{2,})$/.test(email.trim());
}

function hasLetter(value) {
  return /[A-Za-z]/.test(value);
}

function hasDigit(value) {
  return /\d/.test(value);
}

function hasSpecial(value) {
  return /[^\p{L}\p{N}\s]/u.test(value);
}

function isStrongPassword(password) {
  return password.length >= 8 && hasLetter(password) && hasDigit(password) && hasSpecial(password);
}

function getValidationErrors({ email, password, confirmPassword } = {}) {
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (!isStrongPassword(password)) {
    errors.password = "Password must be at least 8 characters and include a letter, a digit, and a special character.";
  }

  if (confirmPassword !== undefined && confirmPassword !== password) {
    errors.confirmPassword = "Passwords must match.";
  }

  return errors;
}

module.exports = {
  getValidationErrors,
  isStrongPassword,
  isValidEmail,
};
