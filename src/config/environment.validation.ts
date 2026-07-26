import Joi from 'joi';

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

  CORS_ORIGIN: Joi.string().uri().required(),
});
