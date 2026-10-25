/**
 * Environment Variable Validation
 *
 * Validates that all required environment variables are set at startup.
 * This prevents runtime errors in production.
 */

type EnvVar = {
  name: string
  required: boolean
  description: string
}

const REQUIRED_VARS: EnvVar[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'Database connection string (PostgreSQL for production)',
  },
  {
    name: 'AUTH_SECRET',
    required: true,
    description: 'Session signing secret (generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))")',
  },
  {
    name: 'ADMIN_PASSWORD',
    required: true,
    description: 'Admin panel login password',
  },
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    required: true,
    description: 'Public site URL (used for metadata and order links)',
  },
]

const OPTIONAL_VARS: EnvVar[] = [
  {
    name: 'RESEND_API_KEY',
    required: false,
    description: 'Resend API key for order confirmation emails',
  },
  {
    name: 'SYSTEM_SENDER_EMAIL',
    required: false,
    description: 'Email sender address for order confirmations',
  },
  {
    name: 'UPSTASH_REDIS_REST_URL',
    required: false,
    description: 'Upstash Redis URL for distributed rate limiting',
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    required: false,
    description: 'Upstash Redis token for distributed rate limiting',
  },
]

export function validateEnvVars(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required variables
  for (const envVar of REQUIRED_VARS) {
    const value = process.env[envVar.name]

    if (!value || value.trim() === '') {
      errors.push(`❌ Missing required: ${envVar.name} - ${envVar.description}`)
    } else if (envVar.name === 'AUTH_SECRET' && value.includes('change-this')) {
      errors.push(`❌ Invalid ${envVar.name}: Must be a strong random value, not placeholder`)
    } else if (envVar.name === 'ADMIN_PASSWORD' && value === 'admin123') {
      warnings.push(`⚠️  ${envVar.name} is using default value - change this in production`)
    }
  }

  // Check optional variables
  for (const envVar of OPTIONAL_VARS) {
    const value = process.env[envVar.name]

    if (!value || value.trim() === '') {
      warnings.push(`⚠️  Optional: ${envVar.name} not set - ${envVar.description}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// Run validation on module import (will be called by next.config.ts or app startup)
export function logEnvValidation() {
  const { valid, errors, warnings } = validateEnvVars()

  if (!valid) {
    console.error('\n❌ Environment Variable Validation Failed:')
    errors.forEach(err => console.error(err))
    console.error('\nPlease set these environment variables before running the application.\n')
    throw new Error('Environment variable validation failed')
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Variable Warnings:')
    warnings.forEach(warn => console.warn(warn))
    console.log()
  }

  console.log('✅ Environment variables validated successfully\n')
}
