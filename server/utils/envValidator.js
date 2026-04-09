const validateEnv = () => {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'JWT_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('CRITICAL ERROR: Missing required environment variables:');
    missing.forEach(key => console.error(`- ${key}`));
    console.error('Server is shutting down to prevent insecure operation.');
    process.exit(1);
  }

  // Warning for non-production placeholders
  if (process.env.JWT_SECRET === 'fallback_secret_for_dev') {
    console.warn('SECURITY WARNING: Using default development JWT_SECRET. This is unsafe for production.');
  }

  console.log('✅ Environment validation successful.');
};

module.exports = validateEnv;
