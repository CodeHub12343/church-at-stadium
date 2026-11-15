// Feature flags read from env. Defaults are the secure/production values;
// set the env var to the opposite string to toggle temporarily.

export const EMAIL_VERIFICATION_ENABLED =
  (process.env.EMAIL_VERIFICATION_ENABLED ?? 'true').toLowerCase() !== 'false';
