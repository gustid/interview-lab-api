import Joi from 'joi';

const corsOriginsSchema = Joi.string()
  .custom((value: string, helpers) => {
    const origins = value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (origins.length === 0) {
      return helpers.error('any.invalid');
    }

    for (const origin of origins) {
      try {
        const url = new URL(origin);

        if (
          !['http:', 'https:'].includes(url.protocol) ||
          url.pathname !== '/' ||
          url.search ||
          url.hash
        ) {
          return helpers.error('any.invalid');
        }
      } catch {
        return helpers.error('any.invalid');
      }
    }

    return value;
  }, 'comma-separated CORS origins')
  .required();

export const environmentValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number().port().default(3000),

  DATABASE_URL: Joi.string()
    .uri({
      scheme: ['postgres', 'postgresql'],
    })
    .required(),

  TEST_DATABASE_URL: Joi.string()
    .uri({
      scheme: ['postgres', 'postgresql'],
    })
    .optional(),

  JWT_SECRET: Joi.string().min(32).required(),

  CORS_ORIGINS: corsOriginsSchema,
});
