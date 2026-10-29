/**
 * Shared client-side validation for lead contact details.
 * Returns { field, message } for the first problem found, or null when valid.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLeadContact({ fullName = '', phone = '', email = '' }) {
  if (!fullName.trim()) {
    return { field: 'full_name', message: 'Please enter the student’s full name.' };
  }
  if (!phone.trim() || phone.replace(/\D/g, '').length < 7) {
    return { field: 'phone', message: 'Please provide a valid phone number with at least 7 digits.' };
  }
  if (email.trim() && !EMAIL_PATTERN.test(email.trim())) {
    return { field: 'email', message: 'Please enter a valid email address, e.g. name@example.com.' };
  }
  return null;
}
