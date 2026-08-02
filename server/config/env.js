const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
];

const OPTIONAL_SERVICE_VARS = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'ESEWA_MERCHANT_CODE',
  'ESEWA_SECRET',
  'KHALTI_SECRET_KEY',
  'GOOGLE_MAPS_API_KEY',
];

export const validateEnv = () => {
  const missingRequired = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missingRequired.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingRequired.join(', ')}. Copy server/.env.example to server/.env and fill them in.`
    );
  }

  const missingOptional = OPTIONAL_SERVICE_VARS.filter((key) => !process.env[key]);

  if (missingOptional.length > 0) {
    console.warn(
      `[env] Optional service credentials not set (features depending on them will be inactive): ${missingOptional.join(', ')}`
    );
  }
};

export default validateEnv;
