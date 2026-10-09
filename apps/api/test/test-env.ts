export const TEST_ENV = {
  NODE_ENV: 'test',
  DATABASE_URL:
    process.env.TEST_DATABASE_URL ??
    'postgresql://adhd:adhd@localhost:5434/adhd_test',
  JWT_SECRET: 'e2e-test-secret-at-least-16-chars',
  CORS_ORIGINS: '',
};
